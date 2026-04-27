<?php

namespace App\Http\Controllers;

use App\Models\Answers;
use App\Models\Candidate;
use App\Models\Exam;
use App\Models\Question;
use App\Models\StudentCourse;
use App\Models\SystemConfig;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class Student extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function login(Request $request)
    {
        Log::info('Student login attempt', [
            'candidate_no' => $request->input('candidate_no'),
            'ticket_no' => $request->input('ticket_no'),
        ]);

        $student = \App\Models\Student::where('candidate_no', $request->input('candidate_no'))->first();
        if (! $student) {
            Log::warning('Student not found', ['candidate_no' => $request->input('candidate_no')]);

            return response()->json('user not found', 404);
        }

        Log::info('Student found', [
            'id' => $student->id,
            'candidate_no' => $student->candidate_no,
            'is_checked_in' => $student->is_checked_in,
            'checkin_time' => $student->checkin_time,
        ]);

        // Check if student has been checked in by invigilator
        if (! $student->is_checked_in || $student->is_checked_in == 0) {
            Log::warning('Student not checked in - blocking login', [
                'candidate_no' => $student->candidate_no,
                'is_checked_in' => $student->is_checked_in,
            ]);

            return response()->json([
                'error' => 'check_in_required',
                'message' => 'Please see the invigilator to check in before starting your exam.',
                'is_checked_in' => $student->is_checked_in,
            ], 403);
        }

        Log::info('Student is checked in - proceeding with login', ['candidate_no' => $student->candidate_no]);

        $ticketNo = $request->input('ticket_no');
        $password = $request->input('password');

        if ($ticketNo) {
            $ticketRecord = \App\Models\ExamTicket::where('ticket_no', $ticketNo)->first();

            if (! $ticketRecord) {
                return response()->json('Invalid ticket number. Please check your ticket and try again.', 404);
            }

            if ($ticketRecord->is_used && $ticketRecord->assigned_to_student_id != $student->id) {
                return response()->json('This ticket has already been used by another student.', 403);
            }

            $examForTicket = Exam::find($ticketRecord->exam_id);

            if (! $examForTicket || $examForTicket->activated !== 'yes') {
                return response()->json('This ticket is not linked to an active exam.', 404);
            }

            $isEnrolled = \App\Models\StudentCourse::where('student_id', $student->id)
                ->where('course_id', $examForTicket->course_id)
                ->exists();

            if (! $isEnrolled) {
                return response()->json('You are not enrolled in this exam\'s course', 403);
            }

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

            if (! $ticketRecord->assigned_to_student_id) {
                $ticketRecord->assigned_to_student_id = $student->id;
                $ticketRecord->assigned_at = now();
                $ticketRecord->is_used = true;
                $ticketRecord->save();

                Log::info('Ticket assigned to student', [
                    'ticket_no' => $ticketNo,
                    'student_id' => $student->id,
                    'exam_id' => $examForTicket->id,
                ]);
            } elseif ($ticketRecord->assigned_to_student_id == $student->id) {
                if (! $ticketRecord->is_used) {
                    $ticketRecord->is_used = true;
                    $ticketRecord->save();
                }
            }

            if ($candidate->ticket_no !== $ticketNo) {
                $candidate->ticket_no = $ticketNo;
                $candidate->save();
            }

            if (! $student->checkin_time && $student->is_checked_in) {
                $student->checkin_time = $candidate->checkin_time ?? now();
                $student->save();
            }

            $student->refresh();

            Log::info('Student login successful', ['candidate_no' => $student->candidate_no]);

            $response = $student->toArray();
            $response['force_password_change'] = (bool) $student->force_password_change;

            return response()->json($response);

        } elseif ($password) {
            if (! Hash::check($password, $student->password)) {
                return response()->json('wrong password!!', 404);
            }

            if ($student->checkin_time == null) {
                return response()->json('user not checked in', 400);
            }

            $response = $student->toArray();
            $response['force_password_change'] = (bool) $student->force_password_change;

            return response()->json($response);
        } else {
            return response()->json('ticket number or password required', 400);
        }
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'current_password' => 'required',
            'new_password' => 'required|min:6',
        ]);

        $student = \App\Models\Student::findOrFail($request->student_id);

        if (! Hash::check($request->current_password, $student->password)) {
            return response()->json(['error' => 'Invalid current password'], 400);
        }

        $student->password = Hash::make($request->new_password);
        $student->force_password_change = false;
        $student->save();

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $studentsQuery = \App\Models\Student::with('level');

        if ($user && $user->role === 'level_admin' && $user->level_id) {
            $studentsQuery->where('level_id', $user->level_id);
        } elseif ($user && $user->role === 'faculty_officer') {
            $studentsQuery->whereHas('level', function ($q) use ($user) {
                $q->where('faculty_id', $user->faculty_id);
            });
        } elseif ($request->has('level_id') && $request->level_id) {
            $studentsQuery->where('level_id', $request->level_id);
        }

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

            $activeExam = Exam::where('activated', 'yes')->first();

            if ($activeExam) {
                $candidate = Candidate::where('student_id', $student_id)
                    ->where('exam_id', $activeExam->id)
                    ->first();

                if ($candidate) {
                    if (is_null($candidate->start_time)) {
                        $candidate->start_time = now()->toIso8601String();
                        $candidate->save();
                    }
                }
            }

            return response()->json($student, 200);
        } catch (Exception $e) {
            return response()->json($e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
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
                'data' => $student,
            ], 201);
        } catch (\Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function exam()
    {
        try {
            $exam = Exam::where('activated', 'yes')->first();
            if (! $exam) {
                return response()->json(['error' => 'No active exam found'], 404);
            }

            $shuffledQuestions = $exam->questions()
                ->whereNotNull('question')
                ->whereNotNull('correct_answer')
                ->whereNotNull('option_b')
                ->inRandomOrder()
                ->get();
            $examResponse = $exam->toArray();

            $data = [
                'exam' => $examResponse,
                'questions' => $shuffledQuestions->values()->all(),
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
                'student_id' => $student_id,
            ]);

            return response()->json($student_course, 201);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function answer_question($student_id, $question_Id, $course_id)
    {
        try {
            $question = Question::findOrFail($question_Id);
            $selected_answer = request('selected_answer');

            $correct_answer = $question->correct_answer;
            $correct_answer_clean = trim(strtolower(html_entity_decode(strip_tags($correct_answer))));
            $selected_answer_clean = trim(strtolower(html_entity_decode(strip_tags($selected_answer))));

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
                    'course_id' => $course_id,
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
            $student = \App\Models\Student::findOrFail($student_id);
            $student->timestamps = false;
            $student->checkout_time = now();
            $student->is_logged_on = 'no';
            $student->is_checked_in = false;
            $student->updated_at = \Carbon\Carbon::now()->format('Y-m-d H:i:s');
            $student->save();

            $candidate = Candidate::where('student_id', $student_id)
                ->whereHas('exam', function ($q) use ($course_id) {
                    $q->where('course_id', $course_id);
                })
                ->with('exam')
                ->latest()
                ->first();

            if ($candidate && $candidate->exam) {
                $exam = $candidate->exam;
                $candidate->is_checkout = 1;
                $candidate->is_checked_in = false;
                $candidate->checkout_time = now();
                $candidate->status = 'submitted';
                $candidate->save();
            } else {
                $exam = Exam::where('course_id', $course_id)
                    ->where('activated', 'yes')
                    ->latest()
                    ->first();

                if (! $exam) {
                    $exam = Exam::where('course_id', $course_id)
                        ->latest()
                        ->first();
                }
            }

            if (! $exam) {
                throw new \Exception('No valid exam found for this submission');
            }

            $courseObj = \App\Models\Course::find($course_id);
            $courseTitle = $courseObj ? $courseObj->title : 'Unknown Course';

            $answers = Answers::where('candidate_id', $student_id)
                ->where('course_id', $course_id)
                ->get();

            $correct_answers_count = $answers->where('is_correct', true)->count();
            $marks_per_question = floatval($exam->marks_per_question);
            $total_score = $correct_answers_count * $marks_per_question;

            $score_record = \App\Models\StudentExamScore::firstOrNew([
                'student_id' => $student_id,
                'course_id' => $course_id,
            ]);

            $score_record->score = $total_score;
            $score_record->course_name = $courseTitle;
            $score_record->timestamps = false;

            $now = \Carbon\Carbon::now()->format('Y-m-d H:i:s');
            if (! $score_record->exists) {
                $score_record->created_at = $now;
            }
            $score_record->updated_at = $now;
            $score_record->save();

            $score_record->timestamps = true;

            $response = [
                'message' => 'Exam submitted successfully',
            ];

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

            \App\Models\ActivityLog::log('submission', "Student {$student->candidate_no} submitted exam", auth()->id());

            return response()->json($response, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to submit exam',
                'message' => $e->getMessage(),
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
            $candidate = Candidate::where('student_id', $student_id)
                ->whereHas('exam', function ($q) {
                    $q->where('activated', 'yes');
                })
                ->with('exam')
                ->latest('updated_at')
                ->first();

            if (! $candidate || ! $candidate->exam) {
                return response()->json(['error' => 'No active exam found for this student. Please ensure you are checked in and the exam is activated.'], 404);
            }

            $exam = $candidate->exam;

            // Calculate total time (base duration + extension)
            $base_duration = (int) $exam->exam_duration;
            $time_extension = $candidate ? (int) ($candidate->time_extension ?? 0) : 0;
            $total_duration = $base_duration + $time_extension;

            // Calculate remaining seconds based on timer mode
            $remaining_seconds = 0;
            $timer_mode = $exam->timer_mode ?? 'individual';

            if ($timer_mode === 'global') {
                // Global timer: all students share the same countdown from exam activation
                if ($exam->activated_date) {
                    $globalStartTime = Carbon::parse($exam->activated_date);
                    $elapsedSeconds = $globalStartTime->diffInSeconds(Carbon::now());
                    $remaining_seconds = ($total_duration * 60) - $elapsedSeconds;
                } else {
                    $remaining_seconds = $total_duration * 60;
                }
            } else {
                // Individual timer: each student's countdown starts when they begin
                if ($candidate && $candidate->start_time) {
                    $startTime = Carbon::parse($candidate->start_time);
                    $elapsedSeconds = $startTime->diffInSeconds(Carbon::now());
                    $remaining_seconds = ($total_duration * 60) - $elapsedSeconds;
                } else {
                    $remaining_seconds = $total_duration * 60;
                }
            }

            // Get questions that are considered valid for the exam and shuffle them deterministically per student
            $query = $exam->questions()
                ->whereNotNull('question')
                ->whereNotNull('correct_answer')
                ->whereNotNull('option_b')
                ->inRandomOrder($student_id);

            // Limit to actual questions if specified
            if ($exam->actual_questions > 0) {
                $query->limit($exam->actual_questions);
            }

            $shuffledQuestions = $query->get();

            $examResponse = $exam->toArray();
            $examResponse['exam_duration'] = $total_duration;
            $examResponse['base_duration'] = $base_duration;
            $examResponse['time_extension'] = $time_extension;
            $examResponse['timer_mode'] = $timer_mode;
            $examResponse['remaining_seconds'] = (int) max(0, floor($remaining_seconds));

            $globalMaxViolations = SystemConfig::get('max_violations', 3);
            $examResponse['max_violations'] = $globalMaxViolations;

            $course = \App\Models\Course::find($exam->course_id);
            $examResponse['course_title'] = $course ? $course->title : 'Unknown Course';
            $examResponse['course_code'] = $course ? $course->code : '';

            $existingAnswers = Answers::where('candidate_id', $student_id)
                ->where('course_id', $exam->course_id)
                ->get();

            $data = [
                'exam' => $examResponse,
                'questions' => $shuffledQuestions->values()->all(),
                'candidate' => $candidate,
                'existing_answers' => $existingAnswers,
            ];

            return response()->json($data, 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
