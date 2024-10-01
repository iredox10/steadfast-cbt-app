<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class Student extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $students = \App\Models\Student::all();
        return response()->json($students);
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
}
