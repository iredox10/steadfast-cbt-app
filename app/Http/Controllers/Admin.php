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
use App\Models\SystemConfig;
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
use App\Models\Question;
use App\Models\Answers;
use App\Models\StudentExamScore;

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

        // Super admins can see everything, but can also filter by level_id if provided
        if ($user->role === 'super_admin') {
            // Check if level_id query parameter is provided
            $levelId = $request->query('level_id');
            if ($levelId && $levelId !== '' && $levelId !== 'all') {
                return $levelId;
            }
            return null; // No filter, show all
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
            // Get only academic sessions (not departments)
            // Academic sessions have "/" in title (e.g., "2023/2024", "2024/2025")
            // Or they are entries WITHOUT head_of_department field (departments have this field)
            $academicSessions = Acd_session::where(function($query) {
                $query->where('title', 'LIKE', '%/%')
                      ->orWhere(function($q) {
                          $q->whereNull('head_of_department')
                            ->whereNull('contact_email')
                            ->whereNull('contact_phone');
                      });
            })->orderBy('title')->get();
            
            return response()->json($academicSessions);
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
            // Deactivate all sessions first
            $sessions = Acd_session::query()->update(['status' => 'inactive']);
            $session = Acd_session::findOrFail($session_id);

            // Deactivate all semesters
            $semesters = Semester::query()->update(['status' => 'inactive']);

            // Activate the selected session
            $session->status = 'active';
            $session->save();

            // Also set as global active session for level admins
            SystemConfig::setGlobalActiveSession($session_id);

            return response()->json($session);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deactivate_session($session_id)
    {
        try {
            $session = Acd_session::findOrFail($session_id);
            $session->status = 'inactive';
            $session->save();

            // Also deactivate all semesters in this session
            Semester::where('acd_session_id', $session_id)->update(['status' => 'inactive']);

            return response()->json($session);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
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
            $user = $request->user();

            // Check if this user already has a semester with the same name in this session
            $existingSemester = Semester::where('acd_session_id', $session_id)
                                      ->where('semester', $validate['semester'])
                                      ->where('created_by', $user->id)
                                      ->first();

            if ($existingSemester) {
                return response()->json(['error' => 'You have already created a semester with this name in this session'], 400);
            }

            $semester = Semester::create([
                'acd_session_id' => $session_id,
                'semester' => $validate['semester'],
                'status' => $validate['status'],
                'created_by' => $user->id
            ]);
            return response()->json($semester, 201);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
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
            $user = request()->user();

            $semestersQuery = Acd_session::find($acd_session_id)->semesters();

            // If user is level admin, only show their own semesters
            if ($user && $user->role === 'level_admin') {
                $semestersQuery->where('created_by', $user->id);
            }

            $semesters = $semestersQuery->with('courses')->get();
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
            $user = $request->user();
            
            // Check if course code already exists
            $existingCourse = Course::where('code', $validate['code'])->first();
            if ($existingCourse) {
                return response()->json([
                    'error' => "Course code '{$validate['code']}' already exists. Please use a different course code."
                ], 400);
            }

            // Check if user has permission to add course to this semester
            $semester = Semester::find($semester_id);
            if (!$semester) {
                return response()->json(['error' => 'Semester not found'], 404);
            }

            // If user is level admin, check if they own the semester
            if ($user->role === 'level_admin' && $semester->created_by !== $user->id) {
                return response()->json(['error' => 'You can only add courses to semesters you created'], 403);
            }

            $course = Course::create([
                'semester_id' => $semester_id,
                'title' => $validate['title'],
                'code' => $validate['code'],
                'credit_unit' => $validate['credit_unit'],
                'created_by' => $user->id
            ]);
            return response()->json($course, 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to create course: ' . $e->getMessage()
            ], 500);
        }
    }

    public function get_courses()
    {
        try {
            $user = request()->user();

            $coursesQuery = Course::query();

            // If user is level admin, only show their own courses
            if ($user && $user->role === 'level_admin') {
                $coursesQuery->where('created_by', $user->id);
            }

            $courses = $coursesQuery->get();
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
            $currentUser = $request->user();
            
            // Check if user is authenticated
            if (!$currentUser) {
                return response()->json([
                    'error' => 'Authentication required'
                ], 401);
            }

            $course = Course::findOrFail($course_id);
            $user = User::findOrFail($user_id);

            // Check if level admin is trying to assign a course they don't own
            if ($currentUser->role === 'level_admin' && $course->created_by !== $currentUser->id) {
                return response()->json([
                    'error' => 'You can only assign courses that you created'
                ], 403);
            }

            // Check if level admin is trying to assign course to instructor from another department
            if ($currentUser->role === 'level_admin' && $user->level_id !== $currentUser->level_id) {
                return response()->json([
                    'error' => 'You can only assign courses to instructors in your department'
                ], 403);
            }

            $lecturerCourses = LecturerCourse::where('user_id', $user_id)->get();

            foreach ($lecturerCourses as $key => $value) {
                if ($value->course_id == $course_id) {
                    return response()->json([
                        'error' => 'Course already assigned to this instructor'
                    ], 400);
                }
            }

            $lecturerCourse = LecturerCourse::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'title' => $course->title,
                'code' => $course->code,
                'credit_unit' => $course->credit_unit,
                'status' => $course->status,
                'created_by' => $currentUser->id, // Set the admin who assigned this course
            ]);
            return response()->json($lecturerCourse, 201);
        } catch (Exception $err) {
            return response()->json([
                'error' => 'Failed to assign course: ' . $err->getMessage()
            ], 500);
        }
    }

    public function get_exams()
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $query = Exam::where('submission_status', 'submitted');

            // If user is level_admin, filter by their lecturers' exams
            if ($user->role === 'level_admin') {
                // Get courses assigned to lecturers by this level admin
                $assignedCourseIds = LecturerCourse::where('created_by', $user->id)
                                                   ->pluck('course_id')
                                                   ->toArray();
                
                // Also get lecturer IDs assigned by this level admin
                $assignedLecturerIds = LecturerCourse::where('created_by', $user->id)
                                                     ->pluck('user_id')
                                                     ->toArray();
                
                // Filter exams by either course assignment OR lecturer assignment
                if (!empty($assignedCourseIds) || !empty($assignedLecturerIds)) {
                    $query->where(function($q) use ($assignedCourseIds, $assignedLecturerIds) {
                        if (!empty($assignedCourseIds)) {
                            $q->whereIn('course_id', $assignedCourseIds);
                        }
                        if (!empty($assignedLecturerIds)) {
                            $q->orWhereIn('user_id', $assignedLecturerIds);
                        }
                    });
                } else {
                    // No assignments found, return empty result
                    return response()->json([]);
                }
            }
            // Super admin sees all exams (no filtering)

            $exams = $query->get();
            
            return response()->json($exams);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
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
            
            // Set level_id if the user is a level admin
            $user = $request->user();
            if ($user && $user->role === 'level_admin' && $user->level_id) {
                $exam->level_id = $user->level_id;
            }
            
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

            // Get total questions and marks for this exam
            $totalQuestions = Question::where('exam_id', $exam_id)->count();
            $totalMarks = $exam->marks_per_question * $totalQuestions;

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
            ->map(function ($student) use ($exam) {
                $candidate = $student->candidates->first();
                $examScore = $student->examScores->first();
                
                // Get answer statistics before candidates are deleted
                $questionsAnswered = 0;
                $correctAnswers = 0;
                if ($candidate) {
                    $questionsAnswered = Answers::where('course_id', $exam->course_id)
                                               ->where('candidate_id', $candidate->id)
                                               ->count();
                    $correctAnswers = Answers::where('course_id', $exam->course_id)
                                            ->where('candidate_id', $candidate->id)
                                            ->where('is_correct', true)
                                            ->count();
                }
                
                return [
                    'student_id' => $student->id,
                    'candidate_no' => $student->candidate_no,
                    'full_name' => $student->full_name,
                    'score' => $examScore ? $examScore->score : 0,
                    'submission_time' => $candidate ? $candidate->created_at : null,
                    'questions_answered' => $questionsAnswered,
                    'correct_answers' => $correctAnswers,
                ];
            })
            ->toArray();

            // Create exam archive with complete data
            ExamArchive::create([
                'exam_id' => $exam_id,
                'exam_title' => $exam->title ?? $course->title . ' Exam',
                'course_title' => $course->title,
                'exam_date' => $exam->activated_date,
                'duration' => $exam->exam_duration,
                'total_questions' => $totalQuestions,
                'marks_per_question' => $exam->marks_per_question,
                'total_marks' => $totalMarks,
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
            $exam->finished_time = now(); // Mark as finished/terminated
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

    public function get_invigilators(Request $request)
    {
        try {
            $user = $request->user();
            $query = User::whereIn('role', ['regular', 'invigilator']);
            
            // If user is level_admin, filter invigilators by their level_id
            if ($user && $user->role === 'level_admin' && $user->level_id) {
                $query->where('level_id', $user->level_id);
            }
            // Super admins see all invigilators (no additional filtering)
            
            $invigilators = $query->get();
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
        // Check if invigilator is assigned - compare email or full_name since the field can contain either
        $isAssigned = ($invigilator->email == $exam->invigilator) || 
                      ($invigilator->full_name == $exam->invigilator) ||
                      ($invigilator->id == $exam->invigilator);
        
        if ($isAssigned) {
            return response()->json(['Invigilator' => $invigilator, 'exam' => $exam, 'examAssigned' => true]);
        }
        return response()->json(['Invigilator' => $invigilator, 'examAssigned' => false]);
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
            
            // Check if archive already has exam statistics stored
            // (New archives created after the update will have these fields)
            if (!isset($archive->total_questions) || $archive->total_questions === null) {
                // For old archives, try to get exam details if exam still exists
                $exam = Exam::find($archive->exam_id);
                
                if ($exam) {
                    // Count questions for this exam
                    $totalQuestions = Question::where('exam_id', $exam->id)->count();
                    $totalMarks = $exam->marks_per_question * $totalQuestions;
                    
                    // Add exam details to response
                    $archive->total_questions = $totalQuestions;
                    $archive->marks_per_question = $exam->marks_per_question;
                    $archive->total_marks = $totalMarks;
                }
            }
            
            // Check if student results already have answer statistics
            // (New archives will have questions_answered and correct_answers)
            $studentResults = collect($archive->student_results);
            $firstResult = $studentResults->first();
            
            if ($firstResult && !isset($firstResult['questions_answered'])) {
                // For old archives, try to calculate from candidates (if they still exist)
                $exam = Exam::find($archive->exam_id);
                
                if ($exam) {
                    $enhancedResults = $studentResults->map(function ($result) use ($exam) {
                        // Try to get candidate (may not exist for terminated exams)
                        $candidate = Candidate::where('student_id', $result['student_id'])
                                             ->where('exam_id', $exam->id)
                                             ->first();
                        
                        if ($candidate) {
                            $answersCount = Answers::where('course_id', $exam->course_id)
                                                  ->where('candidate_id', $candidate->id)
                                                  ->count();
                            
                            $correctAnswers = Answers::where('course_id', $exam->course_id)
                                                    ->where('candidate_id', $candidate->id)
                                                    ->where('is_correct', true)
                                                    ->count();
                            
                            $result['questions_answered'] = $answersCount;
                            $result['correct_answers'] = $correctAnswers;
                        } else {
                            // Candidate doesn't exist (exam was terminated)
                            $result['questions_answered'] = 0;
                            $result['correct_answers'] = 0;
                        }
                        
                        return $result;
                    })->toArray();
                    
                    $archive->student_results = $enhancedResults;
                }
            }
            
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
     * Get exam submissions filtered by level admin's lecturers
     */
    public function getExamSubmissions()
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $query = Candidate::with(['student', 'exam', 'exam.course'])
                              ->orderBy('updated_at', 'desc');

            // If user is level_admin, filter by their lecturers' exams
            if ($user->role === 'level_admin') {
                // Get courses assigned to lecturers by this level admin
                $assignedCourseIds = LecturerCourse::where('created_by', $user->id)
                                                   ->pluck('course_id')
                                                   ->toArray();
                
                // Get exams for those courses
                $examIds = Exam::whereIn('course_id', $assignedCourseIds)
                               ->pluck('id')
                               ->toArray();
                
                // Filter candidates by those exams
                $query->whereIn('exam_id', $examIds);
            }
            // Super admin sees all submissions (no filtering)

            $submissions = $query->get();
            
            // Transform the data to match frontend expectations
            $transformedSubmissions = $submissions->map(function($submission) {
                return [
                    'id' => $submission->id,
                    'student' => [
                        'full_name' => $submission->student->full_name ?? 'N/A',
                        'candidate_no' => $submission->student->candidate_no ?? 'N/A',
                    ],
                    'course' => [
                        'title' => $submission->exam->course->title ?? 'N/A',
                    ],
                    'exam' => [
                        'exam_type' => $submission->exam->exam_type ?? 'N/A',
                    ],
                    'total_questions' => $submission->exam->no_of_questions ?? 0,
                    'answered_questions' => $submission->exam->no_of_questions ?? 0, // Assume all answered for now
                    'score' => $submission->score ?? 0,
                    'submitted_at' => $submission->updated_at,
                ];
            });

            return response()->json($transformedSubmissions);
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

    /**
     * Set global active session (Super Admin only)
     */
    public function setGlobalActiveSession(Request $request, $sessionId)
    {
        try {
            // Verify user is super admin
            $user = $request->user();
            if (!$user || $user->role !== 'super_admin') {
                return response()->json(['error' => 'Only super admins can set global session'], 403);
            }

            // Validate session exists
            $session = Acd_session::findOrFail($sessionId);

            // Set as global active session
            SystemConfig::setGlobalActiveSession($sessionId);

            // Optionally deactivate other sessions if needed
            Acd_session::where('id', '!=', $sessionId)->update(['status' => false]);
            $session->update(['status' => true]);

            return response()->json([
                'message' => 'Global active session set successfully',
                'session' => $session
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to set global active session',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get global active session
     */
    public function getGlobalActiveSession()
    {
        try {
            $session = SystemConfig::getGlobalActiveSession();

            if (!$session) {
                return response()->json(['message' => 'No global active session set'], 404);
            }

            return response()->json($session);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to get global active session',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add course to active session (Level Admin only)
     */
    public function addCourseToActiveSession(Request $request)
    {
        try {
            $user = $request->user();

            // Verify user is level admin or super admin
            if (!$user || !in_array($user->role, ['level_admin', 'super_admin'])) {
                return response()->json(['error' => 'Only level admins can add courses'], 403);
            }

            // Get global active session
            $activeSession = SystemConfig::getGlobalActiveSession();
            if (!$activeSession) {
                return response()->json(['error' => 'No active session set. Please contact super admin.'], 400);
            }

            // Validate input
            $request->validate([
                'code' => 'required|string|max:255',
                'title' => 'required|string|max:255',
                'credit_unit' => 'required|integer|min:1|max:10',
                'semester_id' => 'required|exists:semesters,id'
            ]);

            // Verify semester belongs to active session
            $semester = Semester::where('id', $request->semester_id)
                              ->where('acd_session_id', $activeSession->id)
                              ->first();

            if (!$semester) {
                return response()->json(['error' => 'Invalid semester for active session'], 400);
            }

            // Create course
            $course = Course::create([
                'semester_id' => $request->semester_id,
                'acd_session_id' => $activeSession->id, // Add this for direct association
                'code' => $request->code,
                'title' => $request->title,
                'credit_unit' => $request->credit_unit,
                'created_by' => $user->id
            ]);

            return response()->json([
                'message' => 'Course added successfully',
                'course' => $course->load('semester')
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to add course',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign course to lecturer (Level Admin only)
     */
    public function assignCourseToLecturer(Request $request)
    {
        try {
            $user = $request->user();

            // Verify user is level admin or super admin
            if (!$user || !in_array($user->role, ['level_admin', 'super_admin'])) {
                return response()->json(['error' => 'Only level admins can assign courses'], 403);
            }

            $request->validate([
                'course_id' => 'required|exists:courses,id',
                'lecturer_id' => 'required|exists:users,id'
            ]);

            // For level admins, verify lecturer is in the same level
            if ($user->role === 'level_admin') {
                $lecturer = User::where('id', $request->lecturer_id)
                               ->where('role', 'lecturer')
                               ->where('level_id', $user->level_id)
                               ->first();

                if (!$lecturer) {
                    return response()->json(['error' => 'Lecturer not found in your level'], 404);
                }
            } else {
                // For super admins, just verify lecturer exists and has correct role
                $lecturer = User::where('id', $request->lecturer_id)
                               ->where('role', 'lecturer')
                               ->first();

                if (!$lecturer) {
                    return response()->json(['error' => 'Lecturer not found'], 404);
                }
            }

            // Verify course belongs to active session
            $course = Course::with('semester.acdSession')->find($request->course_id);
            $activeSession = SystemConfig::getGlobalActiveSession();

            if (!$activeSession || $course->semester->acd_session_id !== $activeSession->id) {
                return response()->json(['error' => 'Course does not belong to active session'], 400);
            }

            // Check if assignment already exists
            $existingAssignment = LecturerCourse::where('user_id', $request->lecturer_id)
                                               ->where('course_id', $request->course_id)
                                               ->first();

            if ($existingAssignment) {
                return response()->json(['error' => 'Course already assigned to this lecturer'], 400);
            }

            // Create assignment
            $assignment = LecturerCourse::create([
                'user_id' => $request->lecturer_id,
                'course_id' => $request->course_id,
                'title' => $course->title,
                'code' => $course->code,
                'credit_unit' => $course->credit_unit,
                'status' => 'active'
            ]);

            return response()->json([
                'message' => 'Course assigned successfully',
                'assignment' => $assignment->load(['user', 'course'])
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to assign course',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get courses in active session for level admin
     */
    public function getActiveSessionCourses(Request $request)
    {
        try {
            $user = $request->user();

            // Get global active session
            $activeSession = SystemConfig::getGlobalActiveSession();
            if (!$activeSession) {
                return response()->json(['error' => 'No active session set'], 404);
            }

            // Get courses from active session
            $coursesQuery = Course::whereHas('semester', function($query) use ($activeSession) {
                $query->where('acd_session_id', $activeSession->id);
            });

            // If user is level admin, only show their own courses
            if ($user->role === 'level_admin') {
                $coursesQuery->where('created_by', $user->id);
            }

            $courses = $coursesQuery->with(['semester'])->get();

            return response()->json([
                'session' => $activeSession,
                'courses' => $courses
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to get active session courses',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get semesters for a specific session
     */
    public function getSessionSemesters($sessionId)
    {
        try {
            $user = request()->user();

            // Debug logging
            \Log::info('getSessionSemesters called', [
                'sessionId' => $sessionId,
                'userId' => $user ? $user->id : 'null',
                'userRole' => $user ? $user->role : 'null'
            ]);

            // Check if user is authenticated
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            // Check if user has permission
            if (!in_array($user->role, ['super_admin', 'level_admin'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $semestersQuery = Semester::where('acd_session_id', $sessionId);

            // If user is level admin, only show their own semesters
            if ($user->role === 'level_admin') {
                $semestersQuery->where('created_by', $user->id);
            }

            $semesters = $semestersQuery->get();

            // Debug logging
            \Log::info('getSessionSemesters result', [
                'semestersCount' => $semesters->count(),
                'semesters' => $semesters->toArray()
            ]);

            return response()->json($semesters);

        } catch (Exception $e) {
            return response()->json(['error' => 'Failed to fetch semesters: ' . $e->getMessage()], 500);
        }
    }
}


