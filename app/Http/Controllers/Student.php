<?php

namespace App\Http\Controllers;

use App\Models\Answers;
use App\Models\Exam;
use App\Models\Question;
use App\Models\StudentCourse;
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
        // if (Hash::check($request->input('password'), $user->password)) {
        if ($request->input('password') == $student->password) {
            return response()->json($student);
        } else {
            // return redirect()->back()->with('message', 'wrong password!!');
            return response()->json('wrong password!!');
        }
    }
    public function index()
    {
        //
        $students = \App\Models\Student::all();
        return response()->json($students);
    }

    public function get_student($student_id)
    {
        $student = \App\Models\Student::findOrFail($student_id);
        return response()->json($student, 200);
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
            $questions = $exam->questions;
            $data = [
                'exam' => $exam,
                'questions' => $questions
            ];
            return response()->json($data, 200);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function get_question($question_id)
    {
        $question;
        if ($question_id) {
            $question = Question::findOrFail($question_id);
        }
        $question = \App\Models\Question::inRandomOrder()->first();
        return response()->json($question, 200);
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
                        'is_correct' => true, // Assume you're getting these from the request as boolean  
                        'question' => request('question'),
                        'choice' => request('selected_answer'),
                        'course_id' => request('course_id'),
                        'answered' => true,     // Adjust if necessary based on your input names  
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
                    'is_correct' => false, // Assume you're getting these from the request as boolean  
                    'question' => request('question'),
                    'choice' => request('selected_answer'),
                    'course_id' => request('course_id'),
                    'answered' => true,     // Adjust if necessary based on your input names  
                ]
            );
            return response()->json($answer);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function submit_exam(Request $request, $student_id, $course_id)
    {
        try {
            $student_answered_questions = Answers::where('candidate_id', $student_id)->where('course_id', $course_id)->get();
            // $student_answered_questions = Answers::where('candidate_id', $student_id)->get();
            $marks = Answers::where('is_correct', true)->count();
            return response()->json([$student_answered_questions, $marks]);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function get_courses($student_id)
    {
        try {
            $courses = StudentCourse::findOrFail($student_id);
            return response()->json($courses);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }
}
