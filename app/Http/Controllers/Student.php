<?php

namespace App\Http\Controllers;

use App\Models\Answers;
use App\Models\Candidate;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Student as ModelsStudent;
use App\Models\StudentCourse;
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
        $student = \App\Models\Student::where('candidate_no', $request->input('candidate_no'))->first();
        if (!$student) {
            return response()->json('user not found', 404);
        }
        
        // Check if using ticket number or password
        $ticketNo = $request->input('ticket_no');
        $password = $request->input('password');
        
        if ($ticketNo) {
            // Validate using ticket number
            $candidate = \App\Models\Candidate::where('student_id', $student->id)
                ->where('ticket_no', $ticketNo)
                ->first();
                
            if (!$candidate) {
                return response()->json('invalid ticket number', 404);
            }
            
            // Update the student's checkin_time to match the candidate's checkin_time
            // This ensures the frontend check still works
            $student->checkin_time = $candidate->checkin_time;
            $student->save();
            
            // Reload the student to ensure we have the latest data
            $student->refresh();
        } else if ($password) {
            // Validate using password (legacy method)
            if (!Hash::check($password, $student->password)) {
                return response()->json('wrong password!!', 404);
            }
            
            // For legacy password login, check if student has been checked in
            if ($student->checkin_time == null) {
                return response()->json('user not checked in', 400);
            }
        } else {
            return response()->json('ticket number or password required', 400);
        }
        
        return response()->json($student);
    }

    public function index()
    {
        //
        // $students = \App\Models\Student::all();
        $students = \App\Models\Student::orderBy('checkin_time')->get();
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
            $student->checkout_time = now();
            $student->save();

            // 2. Get exam details first
            $exam = Exam::where('course_id', $course_id)
                ->where('activated', 'yes')
                ->first();

            if (!$exam) {
                throw new \Exception('No active exam found for this course');
            }

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

            // 5. Save the score
            $score_record = \App\Models\StudentExamScore::updateOrCreate(
                [
                    'student_id' => $student_id,
                    'course_id' => $course_id
                ],
                [
                    'score' => number_format($total_score, 2, '.', ''),
                    'course_name' => $exam->course->title ?? 'Unknown Course'
                ]
            );

            // 6. Log the saved score
            \Illuminate\Support\Facades\Log::info('Score Saved', [
                'score_record_id' => $score_record->id,
                'final_score' => $score_record->score
            ]);

            // 7. Return success response
            return response()->json([
                'message' => 'Exam submitted successfully',
                'answered_questions' => $answers,
                'correct_answers' => $correct_answers_count,
                'total_score' => $total_score,
                'score_record' => $score_record
            ], 200);
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
            
            // Create exam response with extended duration
            $examResponse = $exam->toArray();
            $examResponse['exam_duration'] = $total_duration;
            $examResponse['base_duration'] = $base_duration;
            $examResponse['time_extension'] = $time_extension;
            
            $data = [
                'exam' => $examResponse,
                'questions' => $shuffledQuestions->values()->all(),
                'candidate' => $candidate
            ];
            
            return response()->json($data, 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}