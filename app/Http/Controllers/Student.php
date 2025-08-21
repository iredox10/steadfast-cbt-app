<?php

namespace App\Http\Controllers;

use App\Models\Answers;
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
            
            // Check if there's an active exam
            if (!$exam) {
                return response()->json([
                    'message' => 'No active exam found'
                ], 404);
            }
            
            $questions = $exam->questions;
            
            // Filter out questions with empty or null required fields
            $validQuestions = $questions->filter(function ($question) {
                return !empty($question->question) && 
                       !empty($question->correct_answer) &&
                       !empty($question->option_a) && 
                       !empty($question->option_b) && 
                       !empty($question->option_c) && 
                       !empty($question->option_d);
            });
            
            // Shuffle the questions collection
            $shuffledQuestions = $validQuestions->shuffle();
            
            // Ensure all question properties are properly loaded
            $questionsWithAnswers = $shuffledQuestions->map(function ($question) {
                return [
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
            });
            
            $data = [
                'exam' => $exam,
                'questions' => $questionsWithAnswers->values()->all() // Reset array keys after shuffling
            ];
            
            return response()->json($data, 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch exam data',
                'message' => $e->getMessage()
            ], 500);
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
            $question = Question::findOrFail($question_Id);
            $answeredQuestion = strip_tags($question->question);
            $correct_answer = strip_tags($question->correct_answer);
            $answer;

            if (html_entity_decode($correct_answer) === request('selected_answer')) {
                $answer = Answers::updateOrCreate(
                    [
                        'question_id' => $question_Id,
                        'candidate_id' => $student_id,
                    ],
                    [
                        'is_correct' => true,
                        'question' => request('question'),
                        'choice' => request('selected_answer'),
                        'course_id' => request('course_id'),
                        'answered' => true,
                    ]
                );
                return response()->json($answer);
            }
            $answer = Answers::updateOrCreate(
                [
                    'question_id' => $question_Id,
                    'candidate_id' => $student_id,
                ],
                [
                    'is_correct' => false,
                    'question' => request('question'),
                    'choice' => request('selected_answer'),
                    'course_id' => request('course_id'),
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
            $student_answered_questions = Answers::where('candidate_id', $student_id)->where('course_id', $course_id)->get();
            $student->checkout_time = now();
            $student->save();
            
            // Count correct answers
            $correct_answers_count = Answers::where('candidate_id', $student_id)
                ->where('course_id', $course_id)
                ->where('is_correct', true)
                ->count();
                
            return response()->json([
                'message' => 'Exam submitted successfully',
                'answered_questions' => $student_answered_questions,
                'correct_answers_count' => $correct_answers_count
            ], 200);
        } catch (Exception $e) {
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
}