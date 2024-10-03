<?php

namespace App\Http\Controllers;

use App\Models\Acd_session;
use App\Models\Course;
use App\Models\LecturerCourse;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Http\Request;

class Admin extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function add_acd_session(Request $request)
    {
        $validate = request()->validate([
            'title' => 'string | required',
            'status' => 'string',
        ]);
        try {
            $acd_session = Acd_session::create($validate);
            return response()->json($acd_session);
        } catch (\Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function add_semester(Request $request, $session_id)
    {
        $validate = request()->validate([
            'semester' => 'string | required',
            'status' => 'string | required'
        ]);
        try {
            $semester = Semester::create([
                'acd_session_id' => $session_id,
                'semester' => $validate['semester'],
                'status' => $validate['status']
            ]);
            return response()->json($semester);
        } catch (\Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function get_semesters($acd_session_id)
    {
        $semesters = Acd_session::find($acd_session_id)->semesters;
        return response()->json($semesters);
    }

    public function add_course(Request $request, $semester_id)
    {
        $validate = request()->validate([
            'title' => 'required | string',
            'code' => 'required | string',
            'credit_unit' => 'required | string',
        ]);

        try {
            $course = Course::create([
                'semester_id' => $semester_id,
                'title' => $validate['title'],
                'code' => $validate['code'],
                'credit_unit' => $validate['credit_unit']
            ]);
            return response()->json($course);
        } catch (\Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function get_course($course_id)
    {
        $course = Course::find($course_id);
        return response()->json($course);
    }
    public function get_courses($semester_id)
    {
        $courses = Semester::find($semester_id)->courses;
        return response()->json($courses);
    }

    public function activate_exam(Request $request, $exam_id){
        // $exam = Exam::findOrFail($exam_id);

    }

    public function add_lecturer_course(Request $request, $user_id, $course_id){
        try{
            $course = Course::findOrFail($course_id);
            $user = User::findOrFail($user_id);
            $lecturerCourses = LecturerCourse::all();
            
            $lecturerCourse = LecturerCourse::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'title' => $course->title,
                'code' => $course->code,
                'credit_unit' => $course->credit_unit,
                'status' => $course->status,
            ]);
            return response()->json($lecturerCourse);
        }catch(\Exception $err){
            return response()->json($err->getMessage());
        }
    }

}
