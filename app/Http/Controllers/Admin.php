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
            return response()->json($sessions);
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

    public function activate_session($session_id)
    {
        try {
            $sessions = Acd_session::query()->update(['status' => 'inactive']);
            $session = Acd_session::findOrFail($session_id);
            $semesters = Semester::query()->update(['status' => 'inactive']);

            $session->status = 'active';
            $session->save();
            return response()->json($session);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function activate_semester($semester_id)
    {
        try {
            $semesters = Semester::query()->update(['status' => 'inactive']);
            $semester = Semester::findOrFail($semester_id);

            $semester->status = 'active';
            $semester->save();
            return response()->json($semester);
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

            $semesters = Acd_session::findOrFail($session_id)->semesters;

            if ($semesters) {
                foreach ($semesters as $semester) {
                    if ($semester->semester == $validate['semester']) {
                        return response()->json('semesters already existed', 404);
                    }
                }
            }
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
            return response()->json($e->getMessage(), 400);
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

    public function get_active_session()
    {
        $session = Acd_session::where('status', 'active')->first();
        $semesters = Acd_session::findOrFail($session->id)->semesters;
        $activeSemester = null;

        foreach ($semesters as $semester) {
            if ($semester->status === 'active') {
                $activeSemester = $semester;
                break;
            }
        }

        if ($activeSemester) {
            $courses = Course::where('semester_id', $activeSemester->id)->get();
            return response()->json($courses);
        }
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
        try {
            $exams = Exam::query()->update(['activated' => 'no']);
            $exam = Exam::findOrFail($exam_id);
            $exam_duration = $exam->exam_duration;

            $exam->activated = 'yes';
            $exam->activated_date = Carbon::now();
            $exam->invigilator = $request->invigilator;
            // $exam->start_time = Carbon::
            $exam->save();
            return response()->json($exam);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function terminate_exam($exam_id)
    {
        try {
            $exam = Exam::findOrFail($exam_id);
            Exam::query()->update(['invigilator' => null]);
            $students = Student::all();

            foreach ($students as $student) {
                $student->is_logged_on = 'no';
                $student->checkin_time = null;
                $student->checkout_time = null;
                $student->save();
            }
            
            $exam->activated = 'no';
            $exam->save();
            return response()->json($exam);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function register_student(Request $request, $user_id)
    {
        try {
            $student = Student::create([
                'candidate_no' => $request->candidate_no,
                'full_name' => $request->full_name,
                'department' => $request->department,
                'programme' => $request->programme,
                'password' => bcrypt($request->password),
                'is_logged_on' => 'no'
            ]);
            return response()->json($student, 201);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }
    // public function register_student(Request $request, $user_id)
    // {
    //     // Validate the request data
    //     $validate = request()->validate([
    //         'candidate_no' => 'required|string',
    //         'full_name' => 'required|string',
    //         'programme' => 'required|string',
    //         'department' => 'required|string',
    //         'password' => 'required|string',
    //         'is_logged_on' => 'required|string',
    //         // 'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
    //     ]);

    //     try {
    //         // Verify user exists
    //         $user = User::findOrFail($user_id);

    //         $student = Student::create([
    //             'candidate_no' => $validate['candidate_no'],
    //             'full_name' => $validate['full_name'],
    //             'programme' => $validate['programme'],
    //             'department' => $validate['department'],
    //             'password' => bcrypt($validate['password']),
    //             'is_logged_on' => $validate['is_logged_on'],
    //             // 'image' => $imagePath,
    //         ]);

    //         return response()->json([
    //             'message' => 'Student registered successfully',
    //             'student' => $student
    //         ], 201);

    //     } catch (ModelNotFoundException $e) {
    //         return response()->json(['error' => 'User not found'], 404);
    //     } catch (Exception $e) {
    //         Log::error('Student registration failed: ' . $e->getMessage());
    //         return response()->json(['error' => $e->getMessage()], 500);
    //     }
    // }

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


    public function upload_excel(Request $request)
    {
        try {
            $request->validate([
                'excel_file' => 'required|mimes:xlsx,xls',
            ]);

            Excel::import(new StudentsImport, $request->file('excel_file'));

            return response()->json(['message' => 'File imported successfully'], 201);
        } catch (Exception $e) {

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getDashboardStats()
    {
        try {
            $stats = [
                'total_students' => Student::count(),
                'active_courses' => Course::count(),
                'total_instructors' => User::where('role', 'lecturer')->count(),
                'academic_sessions' => Acd_session::count(),
            ];

            return response()->json($stats);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function get_invigilators()
    {
        try {
            $invigilators = User::where('role', 'regular')->get();
            return response()->json($invigilators);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function get_invigilator($invigilator_id)
    {
        $invigilator = User::findOrFail($invigilator_id);
        $exam = Exam::where('activated', 'yes')->first();

        if (!$exam) {
            return response()->json('no exam activated');
        }
        if ($invigilator->email == $exam->invigilator) {
            return response()->json(['invigilator' => $invigilator, 'exam' => $exam, 'examAssigned' => true]);
        }
        return response()->json(['invigilator' => $invigilator, 'examAssigned' => false]);
    }
}
