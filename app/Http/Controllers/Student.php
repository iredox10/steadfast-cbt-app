<?php

namespace App\Http\Controllers;

use App\Models\Answers;
use App\Models\Candidate;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Student as ModelsStudent;
use App\Models\StudentCourse;
use App\Models\ExamTicket;
use App\Models\SystemConfig;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class Student extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function login(Request $request)
    {
        \Log::info('Student login attempt', [
            'candidate_no' => $request->input('candidate_no'),
            'ticket_no' => $request->input('ticket_no')
        ]);

        $student = \App\Models\Student::where('candidate_no', $request->input('candidate_no'))->first();
        if (!$student) {
            \Log::warning('Student not found', ['candidate_no' => $request->input('candidate_no')]);
            return response()->json('user not found', 404);
        }
        
        \Log::info('Student found', [
            'id' => $student->id,
            'candidate_no' => $student->candidate_no,
            'is_checked_in' => $student->is_checked_in,
            'checkin_time' => $student->checkin_time
        ]);

        // Check if student has been checked in by invigilator
        // Cast to boolean to handle tinyint properly
        if (!$student->is_checked_in || $student->is_checked_in == 0) {
            \Log::warning('Student not checked in - blocking login', [
                'candidate_no' => $student->candidate_no,
                'is_checked_in' => $student->is_checked_in
            ]);
            return response()->json([
                'error' => 'check_in_required',
                'message' => 'Please see the invigilator to check in before starting your exam.',
                'is_checked_in' => $student->is_checked_in
            ], 403);
        }
        
        \Log::info('Student is checked in - proceeding with login', ['candidate_no' => $student->candidate_no]);
        
        // Check if using ticket number or password
        $ticketNo = $request->input('ticket_no');
        $password = $request->input('password');
        
        if ($ticketNo) {
            // NEW FLOW: Find the ticket and assign it to this student if not already assigned
            $ticketRecord = \App\Models\ExamTicket::where('ticket_no', $ticketNo)->first();

            if (!$ticketRecord) {
                return response()->json('Invalid ticket number. Please check your ticket and try again.', 404);
            }

            // Check if ticket is already used by another student
            if ($ticketRecord->is_used && $ticketRecord->assigned_to_student_id != $student->id) {
                return response()->json('This ticket has already been used by another student.', 403);
            }

            // Get the exam for this ticket
            $examForTicket = Exam::find($ticketRecord->exam_id);

            if (!$examForTicket || $examForTicket->activated !== 'yes') {
                return response()->json('This ticket is not linked to an active exam.', 404);
            }

            // Confirm student is enrolled in the course linked to the ticket's exam
            $isEnrolled = \App\Models\StudentCourse::where('student_id', $student->id)
                ->where('course_id', $examForTicket->course_id)
                ->exists();

            if (!$isEnrolled) {
                return response()->json('You are not enrolled in this exam\'s course', 403);
            }

            // Ensure a candidate record exists for this student and exam
            $candidate = \App\Models\Candidate::firstOrCreate(
                [
                    'student_id' => $student->id,
                    'exam_id' => $examForTicket->id,
                ],
                [
                    'full_name' => $student->full_name,
                    'programme' => $student->programme,
                    'department' => $student->department,
                    'password' => $student->password,
                    'is_logged_on' => 0,
                    'is_checkout' => 0,
                    'checkin_time' => $student->checkin_time ?? now(),
                    'checkout_time' => null,
                    'ticket_no' => $ticketNo,
                    'status' => 'active',
                ]
            );

            // ASSIGN ticket to this student ONLY after successful candidate creation/retrieval
            // and ONLY if we are sure we are proceeding.
            if (!$ticketRecord->assigned_to_student_id) {
                $ticketRecord->assigned_to_student_id = $student->id;
                $ticketRecord->assigned_at = now();
                $ticketRecord->is_used = true;
                $ticketRecord->save();
                
                \Log::info('Ticket assigned to student', [
                    'ticket_no' => $ticketNo,
                    'student_id' => $student->id,
                    'exam_id' => $examForTicket->id
                ]);
            } else if ($ticketRecord->assigned_to_student_id == $student->id) {
                // Ticket already assigned to this student, ensure it's marked used
                if (!$ticketRecord->is_used) {
                    $ticketRecord->is_used = true;
                    $ticketRecord->save();
                }
            }

            // Update candidate ticket if it differs
            if ($candidate->ticket_no !== $ticketNo) {
                $candidate->ticket_no = $ticketNo;
                $candidate->save();
            }

            // Ensure student check-in time is recorded
            if (!$student->checkin_time && $student->is_checked_in) {
                $student->checkin_time = $candidate->checkin_time ?? now();
                $student->save();
            }

            $student->refresh();

            \Log::info('Student login successful', ['candidate_no' => $student->candidate_no]);
            return response()->json($student);
            
        } else if ($password) {
            // Legacy password login (kept for backward compatibility)
            if (!Hash::check($password, $student->password)) {
                return response()->json('wrong password!!', 404);
            }
            
            if ($student->checkin_time == null) {
                return response()->json('user not checked in', 400);
            }
            
            return response()->json($student);
        } else {
            return response()->json('ticket number or password required', 400);
        }
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $studentsQuery = \App\Models\Student::with('level');
        
        // Apply level filtering based on user role
        if ($user && $user->role === 'level_admin' && $user->level_id) {
            // Level admins can only see students in their level
            $studentsQuery->where('level_id', $user->level_id);
        } elseif ($request->has('level_id') && $request->level_id) {
            // Super admins can filter by specific level
            $studentsQuery->where('level_id', $request->level_id);
        }
        // Super admins with no level filter see all students
        
        $students = $studentsQuery->orderBy('checkin_time')->get();
        return response()->json($students);
    }

    public function get_student($student_id)
    {
        $student = \App\Models\Student::findOrFail($student_id);
        return response()->json($student, 200);
    }

    public function start_exam($student_id)
    {
        try {
            $student = \App\Models\Student::findOrFail($student_id);
            $student->is_logged_on = 'yes';
            $student->save();
            return response()->json($student, 200);
        } catch (Exception $e) {
            return response()->json($e->getMessage(), 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        try {

            $validate = $request->validate([
                'candidate_no' => 'required | string | max:255',
                'full_name' => 'required | string | max:255',
                'programme' => ' string | max:255',
                'department' => ' string | max:255',
            ]);
            $student = \App\Models\Student::create($validate);
            return response()->json([
                'message' => 'student created',
                'data' => $student
            ], 201);
        } catch (\Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function exam()
    {
        try {
            $exam = Exam::where('activated', 'yes')->first();
            if (!$exam) {
                return response()->json(['error' => 'No active exam found'], 404);
            }

            // Get questions that are considered valid for the exam.
            $validQuestions = $exam->questions()
                ->whereNotNull('question')
                ->whereNotNull('correct_answer')
                ->whereNotNull('option_b')
                ->get();

            // Shuffle the valid questions.
            $shuffledQuestions = $validQuestions->shuffle();
            
            // The original $exam object might still have the full (unfiltered) list of questions if they were loaded before.
            // Let's create a clean response.
            $examResponse = $exam->toArray();
            
            $data = [
                'exam' => $examResponse,
                'questions' => $shuffledQuestions->values()->all()
            ];
            
            return response()->json($data, 200);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function get_question($question_id = null)
    {
        try {
            $question = null;
            if ($question_id) {
                $question = Question::findOrFail($question_id);
            } else {
                $question = Question::inRandomOrder()->first();
            }
            
            // Ensure all question properties are properly returned
            $questionData = [
                'id' => $question->id,
                'question' => $question->question,
                'exam_id' => $question->exam_id,
                'user_id' => $question->user_id,
                'correct_answer' => $question->correct_answer,
                'option_a' => $question->option_a,
                'option_b' => $question->option_b,
                'option_c' => $question->option_c,
                'option_d' => $question->option_d,
            ];
            
            return response()->json($questionData, 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function add_course(Request $request, $student_id)
    {
        $validate = request()->validate([
            'course_id' => 'string | required',
        ]);
        try {
            $student_courses = \App\Models\Student::findOrFail($student_id)->courses;
            foreach ($student_courses as $key => $value) {
                if ($validate['course_id'] == $value->course_id) {
                    return response()->json('course already exist', 400);
                }
            }
            $student_course = StudentCourse::create([
                'course_id' => $validate['course_id'],
                'student_id' => $student_id
            ]);
            return response()->json($student_course, 201);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function answer_question($student_id, $question_Id, $course_id)
    {
        try {
            \Illuminate\Support\Facades\Log::info('Answer Question Request', [
                'student_id' => $student_id,
                'question_id' => $question_Id,
                'course_id' => $course_id,
                'request_data' => request()->all()
            ]);

            $question = Question::findOrFail($question_Id);
            $selected_answer = request('selected_answer');

            // Clean and normalize both answers for comparison
            $correct_answer = $question->correct_answer;
            $selected_answer_clean = $selected_answer;

            // Remove HTML tags and decode entities for both answers
            $correct_answer_clean = html_entity_decode(strip_tags($correct_answer));
            $selected_answer_clean = html_entity_decode(strip_tags($selected_answer));

            // Trim whitespace and convert to lowercase for comparison
            $correct_answer_clean = trim(strtolower($correct_answer_clean));
            $selected_answer_clean = trim(strtolower($selected_answer_clean));

            // Log the comparison for debugging
            \Illuminate\Support\Facades\Log::info('Answer Comparison', [
                'question_id' => $question_Id,
                'correct_answer_raw' => $correct_answer,
                'selected_answer_raw' => $selected_answer,
                'correct_answer_clean' => $correct_answer_clean,
                'selected_answer_clean' => $selected_answer_clean
            ]);

            // Compare the cleaned answers
            $is_correct = $correct_answer_clean === $selected_answer_clean;
            
            $answer = Answers::updateOrCreate(
                [
                    'question_id' => $question_Id,
                    'candidate_id' => $student_id,
                ],
                [
                    'is_correct' => $is_correct,
                    'question' => request('question'),
                    'choice' => $selected_answer,
                    'course_id' => $course_id,  // Use the URL parameter
                    'answered' => true,
                ]
            );
            return response()->json($answer);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function submit_exam($student_id, $course_id)
    {
        try {
            // 1. Update student checkout time
            $student = \App\Models\Student::findOrFail($student_id);
            // Disable auto timestamps to prevent truncation error on students table
            $student->timestamps = false;
            $student->checkout_time = now();
            $student->updated_at = \Carbon\Carbon::now()->format('Y-m-d H:i:s');
            $student->save();

            // 2. Get the exam via Candidate record first (most accurate)
            // This ensures we get the specific exam the student was taking, even if it's now deactivated
            $candidate = Candidate::where('student_id', $student_id)
                ->whereHas('exam', function($q) use ($course_id) {
                    $q->where('course_id', $course_id);
                })
                ->with('exam') // Removed nested eager load of course to avoid potential relationship errors
                ->latest() // Get the most recent candidacy
                ->first();

            if ($candidate && $candidate->exam) {
                $exam = $candidate->exam;
            } else {
                // Fallback 1: try to find any active exam for this course
                $exam = Exam::where('course_id', $course_id) // Removed with('course')
                    ->where('activated', 'yes')
                    ->latest()
                    ->first();
                
                // Fallback 2: If no active exam, find the most recent exam for this course (even if inactive/terminated)
                // This allows late submissions to still be recorded
                if (!$exam) {
                    $exam = Exam::where('course_id', $course_id) // Removed with('course')
                        ->latest()
                        ->first();
                }
            }

            if (!$exam) {
                throw new \Exception('No valid exam found for this submission');
            }

            // Fetch course details manually to ensure we have the title
            $courseObj = \App\Models\Course::find($course_id);
            $courseTitle = $courseObj ? $courseObj->title : 'Unknown Course';

            // 3. Get all answers and calculate score
            $answers = Answers::where('candidate_id', $student_id)
                ->where('course_id', $course_id)
                ->get();

            $correct_answers_count = $answers->where('is_correct', true)->count();
            $marks_per_question = floatval($exam->marks_per_question);
            $total_score = $correct_answers_count * $marks_per_question;

            // 4. Log calculation details
            \Illuminate\Support\Facades\Log::info('Exam Score Calculation', [
                'student_id' => $student_id,
                'course_id' => $course_id,
                'total_questions' => $answers->count(),
                'correct_answers' => $correct_answers_count,
                'marks_per_question' => $marks_per_question,
                'calculated_score' => $total_score,
                'exam_id' => $exam->id
            ]);

            // 5. Save the score using firstOrNew to handle timestamps manually
            $score_record = \App\Models\StudentExamScore::firstOrNew([
                'student_id' => $student_id,
                'course_id' => $course_id
            ]);
            
            $score_record->score = $total_score;
            $score_record->course_name = $courseTitle;
            
            // Disable auto timestamps to prevent truncation error
            $score_record->timestamps = false;
            
            $now = \Carbon\Carbon::now()->format('Y-m-d H:i:s');
            if (!$score_record->exists) {
                $score_record->created_at = $now;
            }
            $score_record->updated_at = $now;
            
            $score_record->save();
            
            // Re-enable timestamps for the instance (good practice)
            $score_record->timestamps = true;

            // 6. Log the saved score
            \Illuminate\Support\Facades\Log::info('Score Saved', [
                'score_record_id' => $score_record->id,
                'final_score' => $score_record->score
            ]);

            // 7. Return success response
            $response = [
                'message' => 'Exam submitted successfully',
            ];

            // Check if students are allowed to see results
            $seeResult = \App\Models\SystemConfig::get('student_see_result', false);
            
            if ($seeResult) {
                $response['answered_questions'] = $answers;
                $response['correct_answers'] = $correct_answers_count;
                $response['total_score'] = $total_score;
                $response['score_record'] = $score_record;
                $response['show_result'] = true;
            } else {
                $response['show_result'] = false;
                $response['message'] = 'Exam submitted successfully. Your results will be released later.';
            }

            return response()->json($response, 200);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Exam Submission Error', [
                'student_id' => $student_id,
                'course_id' => $course_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to submit exam',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function get_courses($student_id)
    {
        try {
            $courses = StudentCourse::where('student_id', $student_id)->get();
            return response()->json($courses);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function check_student($student_id)
    {
        try {
            $student = \App\Models\Student::findOrFail($student_id);
            $student->checkin_time = now();
            $student->save();
            return response()->json($student);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function get_student_exam($student_id)
    {
        try {
            $exam = Exam::where('activated', 'yes')->first();
            if (!$exam) {
                return response()->json(['error' => 'No active exam found'], 404);
            }

            // Get the candidate record for this student and exam
            $candidate = Candidate::where('student_id', $student_id)
                                ->where('exam_id', $exam->id)
                                ->first();

            // Calculate total time (base duration + extension)
            $base_duration = $exam->exam_duration;
            $time_extension = $candidate ? ($candidate->time_extension ?? 0) : 0;
            $total_duration = $base_duration + $time_extension;

            // Get questions that are considered valid for the exam.
            $validQuestions = $exam->questions()
                ->whereNotNull('question')
                ->whereNotNull('correct_answer')
                ->whereNotNull('option_b')
                ->get();

            // Shuffle the valid questions.
            $shuffledQuestions = $validQuestions->shuffle();
            
            // Limit the questions if actual_questions is set and greater than 0
            if ($exam->actual_questions > 0) {
                $shuffledQuestions = $shuffledQuestions->take($exam->actual_questions);
            }
            
            // Create exam response with extended duration
            $examResponse = $exam->toArray();
            $examResponse['exam_duration'] = $total_duration;
            $examResponse['base_duration'] = $base_duration;
            $examResponse['time_extension'] = $time_extension;

            // Override exam's max_violations with global setting from SystemConfig
            $globalMaxViolations = SystemConfig::get('max_violations', 3);
            $examResponse['max_violations'] = $globalMaxViolations;
            
            // Fetch existing answers for this student and course to restore progress
            $existingAnswers = Answers::where('candidate_id', $student_id)
                ->where('course_id', $exam->course_id)
                ->get();
            
            $data = [
                'exam' => $examResponse,
                'questions' => $shuffledQuestions->values()->all(),
                'candidate' => $candidate,
                'existing_answers' => $existingAnswers
            ];
            
            return response()->json($data, 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}