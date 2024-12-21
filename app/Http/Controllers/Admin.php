<?php

namespace App\Http\Controllers;

use App\Imports\StudentsImport;
use Box\Spout\Reader\Common\Creator\ReaderEntityFactory;
use App\Models\Acd_session;
use App\Models\Candidate;
use App\Models\Course;
use App\Models\Exam;
use App\Models\LecturerCourse;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Collections\ExcelCollection;
// use Maatwebsite\Excel\Excel;
// use Maatwebsite\Excel\Facades\Excel as FacadesExcel;
use Maatwebsite\Excel\Facades\Excel;
use PhpParser\Node\Stmt\TryCatch;

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
            return response()->json($acd_session, 201);
        } catch (Exception $e) {
            if ($e->errorInfo[0] == 23505) {
                return response()->json('session already exist', 404);
            }
            return response()->json($e->getMessage());
        }
    }

    public function get_acd_sessions()
    {
        try {
            $sessions = Acd_session::all();
            return response()->json($sessions);;
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }
    public function get_acd_session($session_id)
    {
        try {
            $session = Acd_session::findOrFail($session_id);
            return response()->json($session);
        } catch (Exception $e) {
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
            return response()->json($semester, 201);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function get_semester($semester_id)
    {
        try {
            $semester = Semester::findOrFail($semester_id);
            $semester_courses = Semester::findOrFail($semester_id)->courses;
            return response()->json(['semester' => $semester, 'courses' => $semester_courses]);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function get_semesters($acd_session_id)
    {
        try {
            $semesters = Acd_session::find($acd_session_id)->semesters;
            return response()->json($semesters);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
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
            return response()->json($course, 201);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function get_courses()
    {
        try {

            $courses = Course::all();
            return response()->json($courses);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }
    public function get_course($course_id)
    {
        try {

            $course = Course::findOrFail($course_id);
            return response()->json($course);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function get_semester_courses($semester_id)
    {
        $courses = Semester::find($semester_id)->courses;
        return response()->json($courses);
    }

    public function add_lecturer_course(Request $request, $user_id, $course_id)
    {
        try {
            // $course = Course::findOrFail($course_id);
            $course = Course::findOrFail($course_id);
            $user = User::findOrFail($user_id);

            $lecturerCourses = LecturerCourse::where('user_id', $user_id)->get();

            foreach ($lecturerCourses as $key => $value) {
                if ($value->course_id == $course_id) {
                    return response()->json('course already added', 404);
                }
            }

            $lecturerCourse = LecturerCourse::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'title' => $course->title,
                'code' => $course->code,
                'credit_unit' => $course->credit_unit,
                'status' => $course->status,
            ]);
            return response()->json($lecturerCourse, 201);
        } catch (Exception $err) {
            return response()->json($err->getMessage());
        }
    }

    public function get_exams()
    {
        try {
            $exams = Exam::where('submission_status', 'submitted')->get();
            return response()->json($exams);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function activate_exam(Request $request, $exam_id)
    {
        $validate = request()->validate([]);
        try {
            $exams = Exam::query()->update(['activated' => 'no']);
            $exam = Exam::findOrFail($exam_id);
            $exam_duration = $exam->exam_duration;

            $exam->activated = 'yes';
            $exam->activated_date = Carbon::now();
            // $exam->start_time = Carbon::
            $exam->save();
            return response()->json($exam);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function deactivate_exam($exam_id)
    {
        try {
            $exam = Exam::findOrFail($exam_id);
            $exam->activated = 'no';
            $exam->save();
        } catch (Exception $e) {
            return response()->json($e);
        }
    }

    // public function register_student(Request $request, $user_id)
    // {
    //     $validate = request()->validate([
    //         'candidate_no' => 'string | required',
    //         'full_name' => 'string | required',
    //         'programme' => 'string | required',
    //         'department' => 'string | required',
    //         'password' => 'string | required',
    //         'is_logged_on' => 'string | required',
    //     ]);
    //     $request->validate([
    //         'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
    //     ]);
    //     $imagePath = $request->file('image')->store('images', 'public');

    //     try {
    //         $user = User::findOrFail($user_id);
    //         // if($user->admin){
    //         // $student = Student::create($validate);
    //         $student = Student::create([
    //             'candidate_no' => $validate['candidate_no'],
    //             'full_name' => $validate['full_name'],
    //             'programme' => $validate['programme'],
    //             'department' => $validate['department'],
    //             'password' => $validate['password'],
    //             'is_logged_on' => $validate['is_logged_on'],
    //             'image' => $imagePath,
    //         ]);
    //         return response()->json($student);
    //         // }
    //     } catch (Exception $err) {
    //         return response()->json($err->getMessage());
    //     }
    // }

    // public function register_student(Request $request, $user_id)
    // {
    //     // TODO: implement adding candidate with image

    //     $candidate_no = $request->input('candidate_no');
    //     $full_name = $request->input('full_name');
    //     $programme = $request->input('programme');
    //     $department = $request->input('department');
    //     $password = $request->input('password');
    //     $is_logged_on = $request->input('is_logged_on');
    //     $image = $request->file('image');
    //     return response()->json($image);
    //     // Store the image and get the path  
    //     // $imagePath = $request->file('image')->store('images', 'public');  
    //     // $imagePath = $image->store('images', 'public');
    //     // try {  
    //     //     // Retrieve the user record  
    //     //     $user = User::findOrFail($user_id);  

    //     //     // Create the student record  
    //     //     $student = Candidate::create([  
    //     //         'candidate_no' => $candidate_no,  
    //     //         'full_name' => $full_name,  
    //     //         'programme' => $programme,  
    //     //         'department' => $department,  
    //     //         'password' => bcrypt($password), // Hash the password  
    //     //         'is_logged_on' => $is_logged_on,  
    //     //         'image' => $imagePath,  
    //     //     ]);  

    //     //     // Return a successful JSON response  
    //     //     return response()->json([  
    //     //         'message' => 'Student registered successfully!',  
    //     //         'student' => $student  
    //     //     ], 201); // Return a 201 Created status  

    //     // } catch (ModelNotFoundException $e) {  
    //     //     // Handle the case where the user is not found   
    //     //     return response()->json(['error' => 'User not found'], 404);  
    //     // } catch (Exception $e) {  
    //     //     // Handle any other exceptions  
    //     //     return response()->json(['error' => 'Something went wrong: ' . $e->getMessage()], 500);  
    //     // }  
    // }

    public function register_student(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|mimes:xlsx,csv'
            ]);

            // Excel::import(new StudentsImport, $request->file('file'));
            // return response()->json(['message' => 'File imported']);
            return response()->json($request);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function get_course_students($course_id)
    {
        try {
            $course = Course::find($course_id);
            $students = $course->students;
            return response()->json($students);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    // public function upload_excel(Request $request)
    // {
    //     try {
    //         $request->validate([
    //             'excel_file' => 'required|mimes:xlsx,csv'
    //         ]);

    //         Excel::import(new StudentsImport, $request->file('excel_file'));
    //         return response()->json(['message' => 'File imported']);
    //         // return response()->json($request);

    //     } catch (Exception $e) {
    //         return response()->json($e->getMessage());
    //     }
    // }

    public function upload_excel(Request $request)
    {
        try {
            $request->validate([
                'excel_file' => 'required|mimes:xlsx,xls',
            ]);

            // Log file details for debugging
            Log::info('File uploaded:', ['file' => $request->file('excel_file')]);

            Excel::import(new StudentsImport, $request->file('excel_file'));

            return response()->json(['message' => 'File imported successfully'], 201);
        } catch (Exception $e) {
            // Log the error
            Log::error('Error during import:', ['error' => $e->getMessage()]);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
