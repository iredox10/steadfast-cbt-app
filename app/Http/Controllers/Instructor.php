<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Exam;
use App\Models\Question;
use App\Models\question_bank;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class Instructor extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        //
        $users = User::all();
        return response()->json($users);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validate = request()->validate([
            'email' => 'required | email | string | max:255',
            'password' => 'required| string | max:255',
            'full_name' => 'required| string | max:255',
            'role' => 'required| string | max:255',
            'status' => 'required| string | max:255'
        ]);
        $validate['password'] = Hash::make($validate['password']);
        try {
            $user = User::create($validate);
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::find($id);
        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validate = request()->validate([
            'email' => 'required | email | string | max:255',
            'full_name' => 'required | string | max:255',
            'role' => 'required | string | max:255',
            'status' => 'required | string | max:255',
        ]);
        //
        // $user = User::findOrFail($id);
        // user->email = $validate['email']

        return response()->json($validate);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::find($id);
        $user->delete();

        return response()->json($user);
    }

    // TODO complete this function 
    public function add_exam(Request $request, string $user_id, string $course_id)
    {
        $validate = request()->validate([
            'instruction' => 'string | required',
            'no_of_questions' => 'numeric | required',
            'actual_questions' => 'numeric | required',
            'marks_per_question' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            // 'marks_per_question' => 'numeric | required',
            'max_score' => 'numeric | required',
            'exam_duration' => 'string | required',
        ]);
        // return response()->json($validate);
        try {

            $user = User::find($user_id);
            $course = Course::find($course_id);

            $exam = Exam::create([
                'course_id' => $course->id,
                'user_id' => $user->id,
                'instruction' => $validate['instruction'],
                'max_score' => $validate['max_score'],
                'marks_per_question' => $validate['marks_per_question'],
                'no_of_questions' => $validate['no_of_questions'],
                'actual_questions' => $validate['actual_questions'],
                'exam_duration' => $validate['exam_duration'],
            ]);
            return response()->json($exam,201);
        } catch (\Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function add_question(Request $request, string $user_id, string $exam_id)
    {
        $validate = request()->validate([
            'question' => 'string | required',
            'correct_answer' => 'string | required',
            'option_a' => 'string | required',
            'option_b' => 'string | required',
            'option_c' => 'string | required',
            'option_d' => 'string | required',
        ]);
        try {

            $user = User::findOrFail($user_id);
            $exam = Exam::findOrFail($exam_id);

            $question = Question::create([
                'exam_id' => $exam->id,
                'user_id' => $user->id,
                'question' => $validate['question'],
                'correct_answer' => $validate['correct_answer'],
                'option_a' => $validate['option_a'],
                'option_b' => $validate['option_b'],
                'option_c' => $validate['option_c'],
                'option_d' => $validate['option_d'],
            ]);
            return response()->json($question, 201);
            // Todo: implement question bank
            // if ($question) {
            //     $question_bank = question_bank::create([
            //         'exam_id' => $question->exam_id,
            //         'user_id' => $question->user_id,
            //         'question' => $question->question,
            //         'correct_answer' => $question->correct_answer,
            //         'option_a' => $question->option_a,
            //         'option_b' => $question->option_b,
            //         'option_c' => $question->option_c,
            //         'option_d' => $question->option_d,
            //     ]);
            //     return response()->json(data:[$question,$question_bank]);
            // }
        } catch (\Exception $e) {
            return response()->json($e->getMessage(), 400);
        }
    }

    public function get_questions(Request $request, $exam_id)
    {
        $exam = Exam::findOrFail($exam_id)->questions;
        return response()->json($exam, 200);
    }

    public function get_question(Request $request, $question_id)
    {
        $question = Question::findOrFail($question_id);
        return response()->json($question, 200);
    }
}
