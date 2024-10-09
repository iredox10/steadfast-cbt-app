<?php

namespace App\Http\Controllers;

use App\Models\Exam;
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
            return response()->json('user not found',404);
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

    public function get_student($student_id){
        $student = \App\Models\Student::findOrFail($student_id);
        return response()->json($student,200);
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
        } catch (\Exception $e) {
            return response()->json($e->getMessage());
        }
    }
}
