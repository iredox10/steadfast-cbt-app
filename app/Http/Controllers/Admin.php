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
use App\Models\ExamArchive;

class Admin extends Controller
{
    /**
     * Get the current user's admin level for filtering
     */
    private function getAdminLevelFilter(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return null;
        }
        
        // Super admins can see everything (no filter)
        if ($user->role === 'super_admin') {
            return null;
        }
        
        // Level admins can only see their level
        if ($user->role === 'level_admin') {
            return $user->level_id;
        }
        
        // Regular admins (backward compatibility - can see everything)
        if ($user->role === 'admin') {
            return null;
        }
        
        return null;
    }
    
    /**
     * Check if user can access a specific level
     */
    private function canAccessLevel(Request $request, $levelId)
    {
        $user = $request->user();
        
        if (!$user) {
            return false;
        }
        
        // Super admins can access any level
        if ($user->role === 'super_admin') {
            return true;
        }
        
        // Level admins can only access their own level
        if ($user->role === 'level_admin') {
            return $user->level_id == $levelId;
        }
        
        // Regular admins (backward compatibility)
        if ($user->role === 'admin') {
            return true;
        }
        
        return false;
    }

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
            // Get all academic sessions without eager loading to avoid foreign key issues
            $sessions = Acd_session::orderBy('title')->get();
            return response()->json($sessions);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch academic sessions',
                'message' => $e->getMessage()
            ], 500);
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
            $semesters = Acd_session::find($acd_session_id)->semesters()->with('courses')->get();
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
            $course = Course::findOrFail($exam->course_id);

            // Get all students who took this exam with their scores from student_exam_score table
            $studentResults = Student::whereHas('candidates', function($query) use ($exam_id) {
                $query->where('exam_id', $exam_id);
            })
            ->with([
                'candidates' => function($query) use ($exam_id) {
                    $query->where('exam_id', $exam_id);
                },
                'examScores' => function($query) use ($exam) {
                    $query->where('course_id', $exam->course_id);
                }
            ])
            ->get()
            ->map(function ($student) {
                $candidate = $student->candidates->first();
                $examScore = $student->examScores->first();
                return [
                    'student_id' => $student->id,
                    'candidate_no' => $student->candidate_no,
                    'full_name' => $student->full_name,
                    'score' => $examScore ? $examScore->score : 0,
                    'submission_time' => $candidate ? $candidate->created_at : null,
                ];
            })
            ->toArray();

            // Create exam archive
            ExamArchive::create([
                'exam_id' => $exam_id,
                'exam_title' => $exam->title ?? $course->title . ' Exam',
                'course_title' => $course->title,
                'exam_date' => $exam->activated_date,
                'duration' => $exam->exam_duration,
                'student_results' => $studentResults,
            ]);

            // Reset student statuses and clear exam-related data
            Student::query()->update([
                'is_logged_on' => 'no',
                'checkin_time' => null,
                'checkout_time' => null,
            ]);

            // Clear candidates table for this exam
            Candidate::where('exam_id', $exam_id)->delete();

            // Deactivate exam and clear invigilator
            Exam::query()->update(['invigilator' => null]);
            $exam->activated = 'no';
            $exam->save();

            return response()->json([
                'message' => 'Exam terminated and archived successfully',
                'exam' => $exam
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function register_student(Request $request, $user_id)
    {
        try {
            // Add validation
            $request->validate([
                'candidate_no' => 'required|string|max:50',
                'full_name' => 'required|string|max:255',
                'department' => 'required|string|max:255',
                'programme' => 'required|string|max:255',
            ]);

            $levelId = $this->getAdminLevelFilter($request);
            $user = $request->user();
            
            // For level admins, use their level_id
            if ($user->role === 'level_admin') {
                $levelId = $user->level_id;
            }
            
            $student = Student::create([
                'candidate_no' => $request->candidate_no,
                'full_name' => $request->full_name,
                'department' => $request->department,
                'programme' => $request->programme,
                'password' => bcrypt($request->password),
                'is_logged_on' => 'no',
                'level_id' => $levelId
            ]);
            return response()->json($student, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'All fields are required.',
                'details' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
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

    public function get_current_exam()
    {
        try {
            $exam = Exam::where('activated', 'yes')->first();

            if (!$exam) {
                return response()->json(['message' => 'No active exam found'], 404);
            }

            $course = Course::findOrFail($exam->course_id);

            return response()->json([
                'id' => $exam->id,
                'course_id' => $exam->course_id,
                'exam_name' => $exam->title,
                'start_time' => $exam->activated_date,
                'duration' => $exam->exam_duration,
                'course' => $course->title
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getExamArchives()
    {
        try {
            $archives = ExamArchive::orderBy('created_at', 'desc')->get();
            return response()->json($archives);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getExamArchive($archive_id)
    {
        try {
            $archive = ExamArchive::findOrFail($archive_id);
            return response()->json($archive);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getUpcomingExams()
    {
        try {
            $upcomingExams = Exam::where('submission_status', 'submitted')
                                 ->where('activated', 'no')
                                 ->orderBy('created_at', 'desc')
                                 ->limit(5)
                                 ->get();
            return response()->json($upcomingExams);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getRecentSubmissions()
    {
        try {
            $recentSubmissions = Candidate::with('student', 'exam')
                                        ->orderBy('updated_at', 'desc')
                                        ->limit(5)
                                        ->get();
            return response()->json($recentSubmissions);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Create a new admin user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createAdminUser(Request $request)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            // Create the admin user
            $user = new User();
            $user->full_name = $validatedData['full_name'];
            $user->email = $validatedData['email'];
            $user->password = bcrypt($validatedData['password']);
            $user->role = 'admin';
            $user->status = 'active';
            $user->save();

            // Remove password from response for security
            $userData = $user->toArray();
            unset($userData['password']);

            return response()->json([
                'message' => 'Admin user created successfully',
                'user' => $userData
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to create admin user',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a super admin user
     */
    public function createSuperAdmin(Request $request)
    {
        try {
            $validate = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:6',
            ]);

            $user = new User();
            $user->full_name = $validate['full_name'];
            $user->email = $validate['email'];
            $user->password = bcrypt($validate['password']);
            $user->role = 'super_admin';
            $user->status = 'active';
            $user->level_id = null; // Super admin is not tied to any level
            $user->save();

            $userData = $user->toArray();
            unset($userData['password']);

            return response()->json([
                'message' => 'Super admin created successfully',
                'user' => $userData
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to create super admin',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a level admin user
     */
    public function createLevelAdmin(Request $request)
    {
        try {
            $validate = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:6',
                'level_id' => 'required|exists:acd_sessions,id'
            ]);

            $user = new User();
            $user->full_name = $validate['full_name'];
            $user->email = $validate['email'];
            $user->password = bcrypt($validate['password']);
            $user->role = 'level_admin';
            $user->status = 'active';
            $user->level_id = $validate['level_id'];
            $user->save();

            $userData = $user->toArray();
            unset($userData['password']);

            return response()->json([
                'message' => 'Level admin created successfully',
                'user' => $userData
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to create level admin',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get filtered students based on admin level
     */
    public function getStudentsByLevel(Request $request)
    {
        try {
            $user = $request->user();
            $levelFilter = $this->getAdminLevelFilter($request);
            
            \Log::info('getStudentsByLevel called', [
                'user_id' => $user ? $user->id : null,
                'user_role' => $user ? $user->role : null,
                'user_level_id' => $user ? $user->level_id : null,
                'level_filter' => $levelFilter
            ]);
            
            $studentsQuery = Student::query();
            
            if ($levelFilter !== null) {
                $studentsQuery->where('level_id', $levelFilter);
            }
            
            $students = $studentsQuery->orderBy('checkin_time')->get();
            
            \Log::info('Students returned', [
                'count' => $students->count(),
                'students' => $students->pluck('id', 'full_name')->toArray()
            ]);
            
            return response()->json($students);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to get students',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get filtered exams based on admin level
     */
    public function getExamsByLevel(Request $request)
    {
        try {
            $levelFilter = $this->getAdminLevelFilter($request);
            
            $examsQuery = Exam::with('user', 'level');
            
            if ($levelFilter !== null) {
                $examsQuery->where('level_id', $levelFilter);
            }
            
            $exams = $examsQuery->orderBy('created_at', 'desc')->get();
            return response()->json($exams);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to get exams',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing admin user
     */
    public function updateAdmin(Request $request, $adminId)
    {
        try {
            $admin = User::findOrFail($adminId);
            
            // Validate the request data
            $validate = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $adminId,
                'role' => 'required|in:super_admin,level_admin',
                'level_id' => 'nullable|exists:acd_sessions,id',
                'status' => 'required|in:active,inactive,suspended'
            ]);

            // If role is level_admin, level_id is required
            if ($validate['role'] === 'level_admin' && !$validate['level_id']) {
                return response()->json([
                    'error' => 'Level ID is required for level admin'
                ], 400);
            }

            // If role is super_admin, level_id should be null
            if ($validate['role'] === 'super_admin') {
                $validate['level_id'] = null;
            }

            $admin->update($validate);

            return response()->json([
                'message' => 'Admin updated successfully',
                'admin' => $admin->fresh()
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to update admin',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an admin user
     */
    public function deleteAdmin(Request $request, $adminId)
    {
        try {
            $admin = User::findOrFail($adminId);
            
            // Don't allow deletion of the current user
            if ($admin->id === $request->user()->id) {
                return response()->json([
                    'error' => 'You cannot delete your own account'
                ], 400);
            }

            $admin->delete();

            return response()->json([
                'message' => 'Admin deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to delete admin',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all admin users
     */
    public function getAdmins(Request $request)
    {
        try {
            $admins = User::whereIn('role', ['super_admin', 'level_admin', 'admin'])
                         ->with('level')
                         ->orderBy('created_at', 'desc')
                         ->get();

            return response()->json($admins);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to get admins',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get filtered users (instructors/invigilators) based on admin level
     */
    public function getUsersByLevel(Request $request)
    {
        try {
            $levelFilter = $this->getAdminLevelFilter($request);
            
            $usersQuery = User::whereIn('role', ['lecturer', 'invigilator']);
            
            if ($levelFilter !== null) {
                $usersQuery->where('level_id', $levelFilter);
            }
            
            $users = $usersQuery->orderBy('created_at', 'desc')->get();
            return response()->json($users);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to get users',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}


