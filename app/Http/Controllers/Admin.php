<?php

namespace App\Http\Controllers;

use App\Imports\StudentsImport;
use App\Imports\CoursesImport;
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
use Throwable;
use Illuminate\Database\QueryException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
use App\Models\StudentCourse;
use App\Models\ExamTicket;

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

        // Faculty officers filter by their faculty
        if ($user->role === 'faculty_officer') {
            return null; // They manage multiple levels (departments) within a faculty
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
     * Create a faculty officer user
     */
    public function createFacultyOfficer(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user || $user->role !== 'super_admin') {
                return response()->json(['error' => 'Only super admins can create faculty officers'], 403);
            }

            $validate = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'faculty_id' => 'required|exists:faculties,id'
            ]);

            $newOfficer = new User();
            $newOfficer->full_name = $validate['full_name'];
            $newOfficer->email = $validate['email'];
            $newOfficer->password = bcrypt('password'); // Default password
            $newOfficer->role = 'faculty_officer';
            $newOfficer->status = 'active';
            $newOfficer->faculty_id = $validate['faculty_id'];
            $newOfficer->save();

            $userData = $newOfficer->toArray();
            unset($userData['password']);

            return response()->json([
                'message' => 'Faculty officer created successfully',
                'user' => $userData
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to create faculty officer',
                'message' => $e->getMessage()
            ], 500);
        }
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
     * Get system settings
     */
    public function get_system_settings()
    {
        try {
            $settings = [
                'student_see_result' => SystemConfig::get('student_see_result', false),
                'student_registration_enabled' => SystemConfig::get('student_registration_enabled', true),
                // Security settings
                'enable_browser_lockdown' => SystemConfig::get('enable_browser_lockdown', true),
                'enable_fullscreen' => SystemConfig::get('enable_fullscreen', true),
                'enable_tab_switch_detection' => SystemConfig::get('enable_tab_switch_detection', true),
                'enable_copy_paste_block' => SystemConfig::get('enable_copy_paste_block', true),
                'enable_screenshot_block' => SystemConfig::get('enable_screenshot_block', true),
                'enable_multiple_monitor_check' => SystemConfig::get('enable_multiple_monitor_check', true),
                'max_violations' => SystemConfig::get('max_violations', 3),
            ];
            return response()->json($settings);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update system settings
     */
    public function update_system_setting(Request $request)
    {
        try {
            $user = $request->user();
            if ($user->role !== 'super_admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $validate = $request->validate([
                'key' => 'required|string',
                'value' => 'required'
            ]);

            $key = $validate['key'];
            $value = $validate['value'];
            $type = 'string';
            $description = null;

            // Define types and descriptions for known settings
            switch ($key) {
                case 'student_see_result':
                    $type = 'boolean';
                    $description = 'Whether students can see their result immediately after finishing the exam';
                    break;
                case 'student_registration_enabled':
                    $type = 'boolean';
                    $description = 'Whether new student registrations are enabled';
                    break;
                // Security settings
                case 'enable_browser_lockdown':
                    $type = 'boolean';
                    $description = 'Master switch for exam browser lockdown features';
                    break;
                case 'enable_fullscreen':
                    $type = 'boolean';
                    $description = 'Force fullscreen mode during exams';
                    break;
                case 'enable_tab_switch_detection':
                    $type = 'boolean';
                    $description = 'Detect and log tab/window switching during exams';
                    break;
                case 'enable_copy_paste_block':
                    $type = 'boolean';
                    $description = 'Block copy, paste, and right-click context menu';
                    break;
                case 'enable_screenshot_block':
                    $type = 'boolean';
                    $description = 'Block screenshot shortcuts (PrintScreen, etc.)';
                    break;
                case 'enable_multiple_monitor_check':
                    $type = 'boolean';
                    $description = 'Detect and warn about multiple monitors';
                    break;
                case 'max_violations':
                    $type = 'integer';
                    $description = 'Maximum violations before auto-submit (1-10)';
                    break;
                // Add more cases here
            }

            SystemConfig::set($key, $value, $type, $description);

            return response()->json(['message' => 'Setting updated successfully']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
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
            'title' => ['required', 'string', 'regex:/^\d{4}\/\d{4}$/'],
            'status' => 'string',
        ]);
        
        // Additional validation: ensure the format is YYYY/YYYY+1
        $parts = explode('/', $validate['title']);
        if (count($parts) === 2) {
            $startYear = (int)$parts[0];
            $endYear = (int)$parts[1];
            
            if ($endYear !== $startYear + 1) {
                return response()->json([
                    'error' => 'Invalid session format. The end year must be exactly one year after the start year (e.g., 2022/2023).'
                ], 422);
            }
        }
        
        try {
            $acd_session = Acd_session::create($validate);
            return response()->json($acd_session, 201);
        } catch (QueryException $e) {
            if (isset($e->errorInfo[0]) && $e->errorInfo[0] == 23505) {
                return response()->json('session already exist', 404);
            }
            return response()->json($e->getMessage(), 500);
        } catch (Exception $e) {
            return response()->json($e->getMessage(), 500);
        }
    }

    public function get_acd_sessions()
    {
        try {
            // Get only academic sessions (not departments)
            // Academic sessions must have "/" in title (e.g., "2023/2024")
            $academicSessions = Acd_session::where('title', 'LIKE', '%/%')
                ->orderBy('title')
                ->get();
            
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
            } elseif ($user && $user->role === 'faculty_officer') {
                // Faculty officers see courses in all departments of their faculty
                $coursesQuery->whereHas('semester.acdSession', function($q) use ($user) {
                    $q->where('faculty_id', $user->faculty_id);
                });
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
                'status' => 'active',
                'created_by' => $currentUser->id, // Set the admin who assigned this course
            ]);
            return response()->json($lecturerCourse, 201);
        } catch (Exception $err) {
            return response()->json([
                'error' => 'Failed to assign course: ' . $err->getMessage()
            ], 500);
        }
    }

    public function get_exams(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $query = Exam::query();

            // If user is level_admin, filter by their department (level) or courses they created
            if ($user->role === 'level_admin') {
                $query->where(function($q) use ($user) {
                    // Option 1: Course belongs to the admin's department
                    $q->whereHas('course.semester.acdSession', function($subQ) use ($user) {
                        $subQ->where('id', $user->level_id);
                    })
                    // Option 2: Course was directly created by this admin (backup)
                    ->orWhereHas('course', function($subQ) use ($user) {
                        $subQ->where('created_by', $user->id);
                    });
                });
            } elseif ($user->role === "faculty_officer") {
                $faculty_id = $user->faculty_id;
                $query->where(function($q) use ($faculty_id) {
                    // 1. Exam belongs to a department in this faculty
                    $q->whereIn("level_id", function($sub) use ($faculty_id) {
                        $sub->select("id")->from("acd_sessions")->where("faculty_id", $faculty_id);
                    })
                    // 2. OR Exam was created by someone in this faculty
                    ->orWhereIn("user_id", function($sub) use ($faculty_id) {
                        $sub->select("id")->from("users")
                            ->where("faculty_id", $faculty_id)
                            ->orWhereIn("level_id", function($sub2) use ($faculty_id) {
                                $sub2->select("id")->from("acd_sessions")->where("faculty_id", $faculty_id);
                            });
                    })
                    // 3. OR the associated course belongs to this faculty
                    ->orWhereHas("course", function($cq) use ($faculty_id) {
                        $cq->whereIn("created_by", function($sub) use ($faculty_id) {
                            $sub->select("id")->from("users")
                                ->where("faculty_id", $faculty_id)
                                ->orWhereIn("level_id", function($sub2) use ($faculty_id) {
                                    $sub2->select("id")->from("acd_sessions")->where("faculty_id", $faculty_id);
                                });
                        });
                    });
                });
            }

            $exams = $query->with("course")->get();
            
            return response()->json($exams);
        } catch (Exception $e) {
            return response()->json(["error" => $e->getMessage()], 500);
        }
    }

    public function get_exam_tickets($exam_id)
    {
        try {
            $exam = Exam::findOrFail($exam_id);
            
            // Get all tickets for this exam with student information
            $tickets = ExamTicket::where('exam_id', $exam_id)
                ->with(['student' => function($query) {
                    $query->select('id', 'candidate_no', 'full_name', 'department', 'programme');
                }])
                ->orderBy('is_used', 'asc') // Show available tickets first
                ->orderBy('ticket_no', 'asc')
                ->get()
                ->map(function ($ticket) {
                    return [
                        'id' => $ticket->id,
                        'ticket_no' => $ticket->ticket_no,
                        'is_used' => $ticket->is_used,
                        'status' => $ticket->is_used ? 'Used' : 'Available',
                        'assigned_to_student_id' => $ticket->assigned_to_student_id,
                        "assigned_at" => $ticket->assigned_at ? $ticket->assigned_at->toIso8601String() : null,
                        "student" => $ticket->student ? [
                            "id" => $ticket->student->id,
                            "candidate_no" => $ticket->student->candidate_no,
                            "full_name" => $ticket->student->full_name,
                            "department" => $ticket->student->department,
                            "programme" => $ticket->student->programme,
                        ] : null,
                        "created_at" => $ticket->created_at ? $ticket->created_at->toIso8601String() : null,
                        "updated_at" => $ticket->updated_at ? $ticket->updated_at->toIso8601String() : null,
                    ];
                });

            // Get statistics
            $total = $tickets->count();
            $available = $tickets->where('is_used', false)->count();
            $used = $tickets->where('is_used', true)->count();

            return response()->json([
                'exam' => [
                    'id' => $exam->id,
                    'course_id' => $exam->course_id,
                    'activated' => $exam->activated,
                    'activated_date' => $exam->activated_date,
                ],
                'statistics' => [
                    'total' => $total,
                    'available' => $available,
                    'used' => $used,
                    'percentage_used' => $total > 0 ? round(($used / $total) * 100, 2) : 0,
                ],
                'tickets' => $tickets,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching exam tickets: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'error' => 'Failed to load tickets: ' . $e->getMessage(),
                'exam_id' => $exam_id
            ], 500);
        }
    }

    public function activate_exam(Request $request, $exam_id)
    {
        try {
            // DO NOT deactivate other exams - allow multiple active exams
            // This was removed to support concurrent exam sessions
            $exam = Exam::with('course.semester')->findOrFail($exam_id);
            $exam_duration = $exam->exam_duration;

            $exam->activated = 'yes';
            $exam->activated_date = Carbon::now();
            $exam->invigilator = $request->invigilator;
            
            // Set level_id for consistent filtering
            $user = $request->user();
            if ($user && $user->role === 'level_admin' && $user->level_id) {
                $exam->level_id = $user->level_id;
            } elseif ($user && in_array($user->role, ["faculty_officer", "super_admin"])) {
                // Assign to the actual department (level) of the exam creator
                $examCreator = User::find($exam->user_id);
                if ($examCreator && $examCreator->level_id) {
                    $exam->level_id = $examCreator->level_id;
                } else if ($exam->course) {
                    // Fallback to course creator department
                    $courseCreator = User::find($exam->course->created_by);
                    if ($courseCreator && $courseCreator->level_id) {
                        $exam->level_id = $courseCreator->level_id;
                    }
                }
            }
            
            $exam->save();

            // Generate tickets (NOT assigned to students yet)
            $course = $exam->course;
            $ticketsGenerated = 0;
            
            if ($course) {
                $studentCourses = $course->studentCourses;

                // Count eligible students
                $eligibleStudentCount = 0;
                foreach ($studentCourses as $studentCourse) {
                    $student = Student::find($studentCourse->student_id);
                    
                    if (!$student) {
                        continue;
                    }
                    
                    // Filter by level_id only if both are departments or both are sessions
                    // If they are different types, we rely on course enrollment
                    $examLevel = Acd_session::find($exam->level_id);
                    $studentLevel = Acd_session::find($student->level_id);
                    
                    if ($examLevel && $studentLevel) {
                        $examIsSession = str_contains($examLevel->title, "/");
                        $studentIsSession = str_contains($studentLevel->title, "/");
                        
                        if ($examIsSession === $studentIsSession && $exam->level_id != $student->level_id) {
                            continue;
                        }
                    }
                    
                    $eligibleStudentCount++;
                }
                
                // Check how many unassigned tickets already exist for this exam
                $existingTicketCount = ExamTicket::where('exam_id', $exam->id)
                    ->whereNull('assigned_to_student_id')
                    ->where('is_used', false)
                    ->count();
                
                // Generate additional tickets if needed
                $ticketsToGenerate = $eligibleStudentCount - $existingTicketCount;
                
                if ($ticketsToGenerate > 0) {
                    for ($i = 0; $i < $ticketsToGenerate; $i++) {
                        $ticket_no = ExamTicket::generateUniqueTicketNumber($exam->id);
                        
                        ExamTicket::create([
                            'exam_id' => $exam->id,
                            'ticket_no' => $ticket_no,
                            'is_used' => false,
                            'assigned_to_student_id' => null, // NOT assigned yet
                            'assigned_at' => null,
                        ]);
                        
                        $ticketsGenerated++;
                    }
                }
                
                $totalAvailableTickets = $existingTicketCount + $ticketsGenerated;
            }

            return response()->json([
                'exam' => $exam,
                'tickets_generated' => $ticketsGenerated,
                'total_available_tickets' => $totalAvailableTickets ?? 0,
                'message' => "Exam activated. {$ticketsGenerated} new tickets generated. Total available tickets: " . ($totalAvailableTickets ?? 0) . ". Tickets will be assigned when students login."
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
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
                                               ->where('candidate_id', $student->id)
                                               ->count();
                    $correctAnswers = Answers::where('course_id', $exam->course_id)
                                            ->where('candidate_id', $student->id)
                                            ->where('is_correct', true)
                                            ->count();
                }
                
                return [
                    'student_id' => $student->id,
                    'candidate_no' => $student->candidate_no,
                    'full_name' => $student->full_name,
                    'department' => $student->department,
                    'programme' => $student->programme,
                    'level_id' => $student->level_id,
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

            // Get list of student IDs who took this exam
            $studentIds = Candidate::where('exam_id', $exam_id)
                ->pluck('student_id')
                ->toArray();

            // Reset student statuses ONLY for students who took THIS exam
            if (!empty($studentIds)) {
                Student::whereIn('id', $studentIds)->update([
                    'is_logged_on' => 'no',
                    'checkin_time' => null,
                    'checkout_time' => null,
                    'is_checked_in' => false,
                ]);
            }

            // Clear exam violations for this exam (so subsequent attempts start fresh)
            \App\Models\ExamViolation::where('exam_id', $exam_id)->delete();

            // Clear answers for this exam to ensure fresh start on reactivation
            $questionIds = \App\Models\Question::where('exam_id', $exam_id)->pluck('id');
            if ($questionIds->isNotEmpty()) {
                \App\Models\Answers::whereIn('question_id', $questionIds)->delete();
            }

            // Clear candidates table for this exam (removes all candidate records)
            Candidate::where('exam_id', $exam_id)->delete();

            // Delete all tickets for this exam (both used and unused)
            ExamTicket::where('exam_id', $exam_id)->delete();

            // Deactivate ONLY this exam and clear its invigilator
            $exam->activated = 'no';
            $exam->invigilator = null;
            $exam->finished_time = now(); // Mark as finished/terminated
            $exam->save();

            return response()->json([
                'message' => 'Exam terminated, archived, and all tickets removed successfully',
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
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            $levelId = $this->getAdminLevelFilter($request);
            $user = $request->user();

            // For level admins, use their level_id
            if ($user->role === 'level_admin') {
                $levelId = $user->level_id;
            }

            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('uploads/students'), $imageName);
                $imagePath = 'uploads/students/' . $imageName;
            }

            $student = Student::create([
                'candidate_no' => $request->candidate_no,
                'full_name' => $request->full_name,
                'department' => $request->department,
                'programme' => $request->programme,
                'password' => bcrypt($request->password),
                'image' => $imagePath,
                'is_logged_on' => 'no',
                'level_id' => $levelId
            ]);

            // Check if there's an active exam and automatically generate ticket
            // Only if student is enrolled in the exam's course
            $activeExam = Exam::where('activated', 'yes')->first();
            if ($activeExam) {
                // Check if student is enrolled in this exam's course
                $isEnrolled = \App\Models\StudentCourse::where('student_id', $student->id)
                    ->where('course_id', $activeExam->course_id)
                    ->exists();

                if ($isEnrolled) {
                    $existingCandidate = Candidate::where('student_id', $student->id)
                        ->where('exam_id', $activeExam->id)
                        ->first();

                    if (!$existingCandidate) {
                        // Generate a unique 6-digit ticket number
                        do {
                            $ticket_no = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                        } while (Candidate::where('exam_id', $activeExam->id)->where('ticket_no', $ticket_no)->exists());

                        Candidate::create([
                            'student_id' => $student->id,
                            'exam_id' => $activeExam->id,
                            'full_name' => $student->full_name,
                            'programme' => $student->programme,
                            'department' => $student->department,
                            'password' => $student->password,
                            'is_logged_on' => 0,
                            'is_checkout' => 0,
                            'checkin_time' => now(),
                            'checkout_time' => '',
                            'ticket_no' => $ticket_no,
                            'status' => 'pending',
                        ]);

                        // Add student to the ticket_no field for response
                        $student->ticket_no = $ticket_no;
                    }
                }
            }

            return response()->json($student, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Format validation errors into a readable message
            $errors = $e->errors();
            $errorMessages = [];
            foreach ($errors as $field => $messages) {
                $errorMessages[] = implode(' ', $messages);
            }
            return response()->json([
                'error' => implode(' ', $errorMessages),
                'details' => $errors
            ], 422);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update_student(Request $request, $student_id)
    {
        try {
            $student = Student::findOrFail($student_id);
            
            // Validate the request
            $request->validate([
                'candidate_no' => 'nullable|string|max:50',
                'full_name' => 'nullable|string|max:255',
                'department' => 'nullable|string|max:255',
                'programme' => 'nullable|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($student->image && file_exists(public_path($student->image))) {
                    unlink(public_path($student->image));
                }

                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('uploads/students'), $imageName);
                $student->image = 'uploads/students/' . $imageName;
            }

            // Update other fields if provided
            if ($request->has('candidate_no')) {
                $student->candidate_no = $request->candidate_no;
            }
            if ($request->has('full_name')) {
                $student->full_name = $request->full_name;
            }
            if ($request->has('department')) {
                $student->department = $request->department;
            }
            if ($request->has('programme')) {
                $student->programme = $request->programme;
            }
            if ($request->has('password')) {
                $student->password = bcrypt($request->password);
            }

            $student->save();

            return response()->json([
                'message' => 'Student updated successfully',
                'student' => $student
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Format validation errors into a readable message
            $errors = $e->errors();
            $errorMessages = [];
            foreach ($errors as $field => $messages) {
                $errorMessages[] = implode(' ', $messages);
            }
            return response()->json([
                'error' => implode(' ', $errorMessages),
                'details' => $errors
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
            $course = Course::findOrFail($course_id);
            
            // Get all enrolled students for this course
            $studentCourses = $course->studentCourses;
            $students = [];
            
            foreach ($studentCourses as $studentCourse) {
                $student = Student::find($studentCourse->student_id);
                if ($student) {
                    $students[] = $student;
                }
            }
            
            return response()->json($students);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to get course students',
                'message' => $e->getMessage()
            ], 500);
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

    public function upload_instructors_excel(Request $request)
    {
        try {
            $request->validate([
                'excel_file' => 'required|mimes:xlsx,xls'
            ]);

            $file = $request->file('excel_file');
            $reader = ReaderEntityFactory::createXLSXReader();
            $reader->open($file->getPathname());

            $user = $request->user();
            $rowCount = 0;
            $errors = [];

            foreach ($reader->getSheetIterator() as $sheet) {
                foreach ($sheet->getRowIterator() as $index => $row) {
                    // Skip header row
                    if ($index === 1) continue;

                    $cells = $row->getCells();
                    
                    // Validate minimum required columns
                    if (count($cells) < 3) {
                        $errors[] = "Row $index: Insufficient data";
                        continue;
                    }

                    $full_name = $cells[0]->getValue();
                    $email = $cells[1]->getValue();
                    $password = $cells[2]->getValue();
                    $role = isset($cells[3]) ? $cells[3]->getValue() : 'lecturer';
                    $status = isset($cells[4]) ? $cells[4]->getValue() : 'active';

                    // Validate required fields
                    if (empty($full_name) || empty($email) || empty($password)) {
                        $errors[] = "Row $index: Missing required fields";
                        continue;
                    }

                    try {
                        // Create instructor/user
                        $instructorData = [
                            'full_name' => $full_name,
                            'email' => $email,
                            'password' => bcrypt($password),
                            'role' => $role,
                            'status' => $status
                        ];

                        // If the user is a level admin, set the level_id
                        if ($user->role === 'level_admin') {
                            $instructorData['level_id'] = $user->level_id;
                        }

                        User::create($instructorData);
                        $rowCount++;
                    } catch (\Exception $e) {
                        $errors[] = "Row $index: " . $e->getMessage();
                    }
                }
            }

            $reader->close();

            $response = [
                'message' => "$rowCount instructors imported successfully"
            ];

            if (!empty($errors)) {
                $response['errors'] = $errors;
                $response['partial'] = true;
            }

            return response()->json($response, 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error processing file: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update_instructor_status(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:active,inactive,not_active'
            ]);

            $user = User::findOrFail($id);
            
            // Check authorization - only allow updating if user is super_admin or level_admin managing their level
            $currentUser = $request->user();
            if ($currentUser->role === 'level_admin') {
                if ($user->level_id !== $currentUser->level_id) {
                    return response()->json(['error' => 'Unauthorized'], 403);
                }
            }

            // Map 'inactive' to 'not_active' for database compatibility
            $statusValue = $request->status === 'inactive' ? 'not_active' : $request->status;
            
            $user->status = $statusValue;
            $user->save();

            return response()->json([
                'message' => 'Instructor status updated successfully',
                'instructor' => $user
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error updating status: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getDashboardStats(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user && $user->role === 'faculty_officer') {
                $facultyId = $user->faculty_id;
                
                $total_students = Student::whereHas('level', function($q) use ($facultyId) {
                    $q->where('faculty_id', $facultyId);
                })->count();
                
                $active_courses = Course::whereHas('semester.acdSession', function($q) use ($facultyId) {
                    $q->where('faculty_id', $facultyId);
                })->count();
                
                $total_instructors = User::where('role', 'lecturer')
                    ->whereHas('level', function($q) use ($facultyId) {
                        $q->where('faculty_id', $facultyId);
                    })->count();
                    
                $academic_sessions = Acd_session::where('title', 'LIKE', '%/%')->where('status', 'active')->count();
                
                $stats = [
                    'total_students' => $total_students,
                    'active_courses' => $active_courses,
                    'total_instructors' => $total_instructors,
                    'academic_sessions' => $academic_sessions,
                ];
            } else {
                // Default stats for super admin / generic
                $stats = [
                    'total_students' => Student::count(),
                    'active_courses' => Course::count(),
                    'total_instructors' => User::where('role', 'lecturer')->count(),
                    'academic_sessions' => Acd_session::count(),
                ];
            }

            return response()->json($stats);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function get_invigilators(Request $request)
    {
        try {
            $user = $request->user();
            $query = User::whereIn('role', ['technician']);
            
            // If user is level_admin, filter invigilators by their level_id
            if ($user && $user->role === 'level_admin' && $user->level_id) {
                $query->where('level_id', $user->level_id);
            } elseif ($user && $user->role === "faculty_officer") {
                // Faculty officers see invigilators in all departments of their faculty
                // OR those directly assigned to the faculty
                $query->where(function($q) use ($user) {
                    $q->whereHas("level", function($sq) use ($user) {
                        $sq->where("faculty_id", $user->faculty_id);
                    })->orWhere("faculty_id", $user->faculty_id);
                });
            }
            // Super admins see all invigilators (no additional filtering)
            
            $invigilators = $query->get();
            
            // Get all invigilators already assigned to active exams
            $assignedInvigilators = Exam::where('activated', 'yes')
                ->whereNotNull('invigilator')
                ->where('invigilator', '!=', '')
                ->pluck('invigilator')
                ->toArray();
            
            // Filter out invigilators who are already assigned to active exams
            $availableInvigilators = $invigilators->filter(function($invigilator) use ($assignedInvigilators) {
                // Check if invigilator's email, full_name, or id is in assigned list
                return !in_array($invigilator->email, $assignedInvigilators) &&
                       !in_array($invigilator->full_name, $assignedInvigilators) &&
                       !in_array($invigilator->id, $assignedInvigilators);
            })->values(); // Reset array keys
            
            return response()->json($availableInvigilators);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function get_invigilator($invigilator_id)
    {
        $invigilator = User::findOrFail($invigilator_id);
        
        // Find the active exam assigned to this specific invigilator
        // Support multiple active exams by finding the one assigned to this invigilator
        $exam = Exam::where('activated', 'yes')
            ->where(function($query) use ($invigilator) {
                $query->where('invigilator', $invigilator->email)
                      ->orWhere('invigilator', $invigilator->full_name)
                      ->orWhere('invigilator', $invigilator->id);
            })
            ->first();

        if (!$exam) {
            return response()->json(['Invigilator' => $invigilator, 'examAssigned' => false]);
        }
        
        // Load course details for the exam
        $course = Course::find($exam->course_id);
        if ($course) {
            $exam->course = $course->title;
        }
        
        return response()->json(['Invigilator' => $invigilator, 'exam' => $exam, 'examAssigned' => true]);
    }

    public function get_current_exam(Request $request)
    {
        try {
            $user = $request->user();
            $query = Exam::query();

            // Filter based on user role and hierarchy
            if ($user && $user->role === 'level_admin' && $user->level_id) {
                // Department Officer sees exams in their department
                $query->where(function($q) use ($user) {
                    $q->whereHas('course.semester.acdSession', function($subQ) use ($user) {
                        $subQ->where('id', $user->level_id);
                    })->orWhere('level_id', $user->level_id);
                });
            } elseif ($user && $user->role === 'faculty_officer') {
                // Faculty Officer sees exams in their faculty
                $query->whereHas('course.semester.acdSession', function($q) use ($user) {
                    $q->where('faculty_id', $user->faculty_id);
                });
            }

            // Try to find active exam first
            // Clone query to avoid modifying the original for the fallback
            $exam = (clone $query)->where('activated', 'yes')->latest()->first();

            // If no active exam, find the latest exam (terminated or pending)
            // This allows admin to manage students/extensions for the most recent context even after termination
            if (!$exam) {
                $exam = $query->latest()->first();
            }

            if (!$exam) {
                return response()->json(['message' => 'No active or recent exam found'], 404);
            }

            $course = Course::findOrFail($exam->course_id);

            return response()->json([
                'id' => $exam->id,
                'course_id' => $exam->course_id,
                'exam_name' => $exam->title,
                'start_time' => $exam->activated_date,
                'duration' => $exam->exam_duration,
                'course' => $course->title,
                'status' => $exam->activated === 'yes' ? 'Active' : 'Inactive'
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getExamArchives(Request $request)
    {
        try {
            $user = $request->user();
            
            // Get level filter based on user role
            $levelFilter = $this->getAdminLevelFilter($request);
            
            // Build the query
            $query = ExamArchive::query();
            
            // If faculty_officer, filter by faculty
            if ($user->role === 'faculty_officer') {
                $query->whereHas('exam', function($q) use ($user) {
                    $q->where(function($sq) use ($user) {
                        // Check via course -> semester -> session
                        $sq->whereHas('course.semester.acdSession', function($ssq) use ($user) {
                            $ssq->where('faculty_id', $user->faculty_id);
                        })
                        // Check via direct course -> session
                        ->orWhereHas('course.acdSession', function($ssq) use ($user) {
                            $ssq->where('faculty_id', $user->faculty_id);
                        })
                        // Check via direct exam -> level (session)
                        ->orWhereHas('level', function($ssq) use ($user) {
                            $ssq->where('faculty_id', $user->faculty_id);
                        });
                    });
                });
            } elseif ($levelFilter !== null) {
                // If there's a level filter (level admin), filter archives by exam level_id
                $query->whereHas('exam', function($q) use ($levelFilter) {
                    $q->where('level_id', $levelFilter);
                });
            }
            
            $archives = $query->with('exam')->orderBy('created_at', 'desc')->get();
            
            return response()->json($archives);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getExamArchive(Request $request, $archive_id)
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
            
            if ($studentResults->isNotEmpty()) {
                $firstResult = $studentResults->first();
                
                if (!isset($firstResult['questions_answered'])) {
                    // For old archives, add default values since data cannot be retrieved after termination
                    $enhancedResults = $studentResults->map(function ($result) {
                        // Set default values for old archives
                        // Data is not available because candidates were deleted on termination
                        $result['questions_answered'] = 'N/A';
                        $result['correct_answers'] = 'N/A';
                        return $result;
                    })->toArray();
                    
                    $studentResults = collect($enhancedResults);
                }
            }
            
            // Filter student results based on admin level (department)
            $user = $request->user();
            $levelFilter = $this->getAdminLevelFilter($request);
            
            if ($levelFilter !== null) {
                // Filter student results to show only students from admin's level/department
                $filteredResults = $studentResults->filter(function ($result) use ($levelFilter) {
                    // Check if level_id is stored in the result (new archives)
                    if (isset($result['level_id'])) {
                        return $result['level_id'] == $levelFilter;
                    }
                    // For old archives without level_id, query the student
                    $student = Student::find($result['student_id']);
                    return $student && $student->level_id == $levelFilter;
                })->values()->toArray();
                
                $archive->student_results = $filteredResults;
            } else {
                $archive->student_results = $studentResults->toArray();
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
    public function getExamSubmissions(Request $request)
    {
        try {
            $user = $request->user();
            
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
            } elseif ($user->role === 'faculty_officer') {
                // Faculty officers see submissions for their faculty's departments
                $query->whereHas('exam.course.semester.acdSession', function($q) use ($user) {
                    $q->where('faculty_id', $user->faculty_id);
                });
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
            ]);

            $user = new User();
            $user->full_name = $validate['full_name'];
            $user->email = $validate['email'];
            $user->password = bcrypt('password'); // Default password
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
     * Create a level admin user (Department Officer)
     */
    public function createLevelAdmin(Request $request)
    {
        try {
            $user = $request->user();
            
            // Authorized if super_admin OR faculty_officer
            if (!$user || !in_array($user->role, ['super_admin', 'faculty_officer'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $validate = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'level_id' => 'required|exists:acd_sessions,id'
            ]);

            // If faculty_officer, verify the level (department) belongs to their faculty
            if ($user->role === 'faculty_officer') {
                $department = Acd_session::where('id', $validate['level_id'])
                    ->where('faculty_id', $user->faculty_id)
                    ->first();
                
                if (!$department) {
                    return response()->json(['error' => 'Department not found in your faculty'], 403);
                }
            }

            $newOfficer = new User();
            $newOfficer->full_name = $validate['full_name'];
            $newOfficer->email = $validate['email'];
            $newOfficer->password = bcrypt('password'); // Default password
            $newOfficer->role = 'level_admin';
            $newOfficer->status = 'active';
            $newOfficer->level_id = $validate['level_id'];
            
            // Also link the department officer to the faculty for easier querying
            $dept = Acd_session::find($validate['level_id']);
            $newOfficer->faculty_id = $dept->faculty_id;
            
            $newOfficer->save();

            $userData = $newOfficer->toArray();
            unset($userData['password']);

            return response()->json([
                'message' => 'Department officer created successfully',
                'user' => $userData
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to create department officer',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset admin password
     */
    public function resetAdminPassword($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->password = bcrypt('password');
            $user->save();

            return response()->json([
                'message' => 'Password reset successfully to "password"'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to reset password',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download sample import file for admins
     */
    public function downloadSampleImportFile()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="sample_admins_import.csv"',
        ];

        $columns = ['Full Name', 'Email', 'Role', 'Level ID (Optional)', 'Faculty ID (Optional)'];
        $sampleData = [
            ['John Doe', 'john@example.com', 'level_admin', '1', ''],
            ['Jane Smith', 'jane@example.com', 'super_admin', '', ''],
            ['Alice Faculty', 'alice@example.com', 'faculty_officer', '', '1'],
        ];

        $callback = function () use ($columns, $sampleData) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($sampleData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Import admins from Excel
     */
    public function importAdmins(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|mimes:xlsx,xls,csv',
            ]);

            \Maatwebsite\Excel\Facades\Excel::import(new \App\Imports\AdminsImport, $request->file('file'));

            return response()->json([
                'message' => 'Admins imported successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to import admins',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change current user password
     */
    public function changePassword(Request $request)
    {
        try {
            $request->validate([
                'current_password' => 'required',
                'new_password' => 'required|min:6|confirmed',
            ]);

            $user = $request->user();

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'error' => 'Invalid current password'
                ], 400);
            }

            $user->password = bcrypt($request->new_password);
            $user->save();

            return response()->json([
                'message' => 'Password changed successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to change password',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function getStudentsByLevel(Request $request)
    {
        try {
            $user = $request->user();
            $levelFilter = $this->getAdminLevelFilter($request);

            $studentsQuery = Student::query();

            if ($user->role === 'faculty_officer') {
                $studentsQuery->whereHas('level', function($q) use ($user) {
                    $q->where('faculty_id', $user->faculty_id);
                });
            } elseif ($levelFilter !== null) {
                $studentsQuery->where('level_id', $levelFilter);
            }

            $students = $studentsQuery->orderBy('created_at', 'desc')->get();

            // Get the active exam to fetch ticket numbers
            $examQuery = Exam::query();
            if ($user && $user->role === 'level_admin' && $user->level_id) {
                $examQuery->where('level_id', $user->level_id);
            } elseif ($user && $user->role === 'faculty_officer') {
                $examQuery->whereHas('level', function($q) use ($user) {
                    $q->where('faculty_id', $user->faculty_id);
                });
            }

            // Try to find active exam first
            $activeExam = (clone $examQuery)->where('activated', 'yes')->latest()->first();

            if (!$activeExam) {
                $activeExam = $examQuery->latest()->first();
            }

            if ($activeExam) {
                foreach ($students as $student) {
                    $candidate = Candidate::where('student_id', $student->id)
                        ->where('exam_id', $activeExam->id)
                        ->first();
                    $student->ticket_no = $candidate ? $candidate->ticket_no : null;
                    $student->candidate_id = $candidate ? $candidate->id : null;
                    $student->time_extension = $candidate ? $candidate->time_extension : 0;
                }
            } else {
                foreach ($students as $student) {
                    $student->ticket_no = null;
                    $student->candidate_id = null;
                    $student->time_extension = 0;
                }
            }

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
            $user = $request->user();
            $levelFilter = $this->getAdminLevelFilter($request);

            $examsQuery = Exam::with('user', 'level');

            if ($user->role === 'faculty_officer') {
                $examsQuery->where(function($q) use ($user) {
                    $q->whereHas('course.semester.acdSession', function($subQ) use ($user) {
                        $subQ->where('faculty_id', $user->faculty_id);
                    })
                    ->orWhereHas('level', function($subQ) use ($user) {
                        $subQ->where('faculty_id', $user->faculty_id);
                    });
                });
            } elseif ($levelFilter !== null) {
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
     * Add a course to the active global session
     */
    public function addCourseToActiveSession(Request $request)
    {
        try {
            $validate = $request->validate([
                "title" => "required|string",
                "code" => "required|string|unique:courses,code",
                "credit_unit" => "required|string",
                "semester_id" => "required|exists:semesters,id"
            ]);

            $user = $request->user();
            $semester = Semester::find($validate["semester_id"]);
            
            $course = Course::create([
                "semester_id" => $validate["semester_id"],
                "acd_session_id" => $semester ? $semester->acd_session_id : null,
                "title" => $validate["title"],
                "code" => $validate["code"],
                "credit_unit" => $validate["credit_unit"],
                "created_by" => $user->id
            ]);

            return response()->json($course, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                "error" => "Validation failed",
                "message" => $e->getMessage(),
                "errors" => $e->errors()
            ], 422);
        } catch (\Throwable $e) {
            return response()->json(["error" => $e->getMessage()], 500);
        }
    }

    /**
     * Assign a course to a lecturer
     */
    public function assignCourseToLecturer(Request $request)
    {
        try {
            $request->validate([
                "course_id" => "required|exists:courses,id",
                "lecturer_id" => "required|exists:users,id"
            ]);

            $course = Course::findOrFail($request->course_id);
            $lecturer = User::findOrFail($request->lecturer_id);
            $user = $request->user();

            // Re-assignment logic: delete existing assignments for this course first
            LecturerCourse::where("course_id", $course->id)->delete();

            $assignment = LecturerCourse::create([
                "user_id" => $lecturer->id,
                "course_id" => $course->id,
                "title" => $course->title,
                "code" => $course->code,
                "credit_unit" => $course->credit_unit,
                "status" => "active",
                "created_by" => $user->id
            ]);

            return response()->json($assignment, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(["error" => "Validation failed", "message" => $e->getMessage(), "errors" => $e->errors()], 422);
        } catch (\Throwable $e) {
            return response()->json(["error" => $e->getMessage()], 500);
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
                'role' => 'required|in:super_admin,level_admin,faculty_officer',
                'level_id' => 'nullable|exists:acd_sessions,id',
                'faculty_id' => 'nullable|exists:faculties,id',
                'status' => 'required|in:active,inactive,suspended'
            ]);

            // If role is level_admin, level_id is required
            if ($validate['role'] === 'level_admin' && empty($validate['level_id'])) {
                return response()->json([
                    'error' => 'Level ID is required for department officer'
                ], 400);
            }

            // If role is faculty_officer, faculty_id is required
            if ($validate['role'] === 'faculty_officer' && empty($validate['faculty_id'])) {
                return response()->json([
                    'error' => 'Faculty ID is required for faculty officer'
                ], 400);
            }

            $admin->update($validate);

            return response()->json([
                'message' => 'Administrator updated successfully',
                'user' => $admin
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to update administrator',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an admin user
     */
    public function deleteAdmin($adminId)
    {
        try {
            $admin = User::findOrFail($adminId);
            $admin->delete();

            return response()->json([
                'message' => 'Administrator deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to delete administrator',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get list of all admin users
     */
    public function getAdmins(Request $request)
    {
        try {
            $user = $request->user();
            
            $query = User::whereIn('role', ['super_admin', 'level_admin', 'admin', 'faculty_officer'])
                         ->with(['level', 'faculty']);

            // Apply role-based filtering
            if ($user->role === 'faculty_officer') {
                // Faculty officers can only see admins from their faculty
                $query->where('faculty_id', $user->faculty_id);
            }

            $admins = $query->orderBy('full_name')->get();
            return response()->json($admins);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to get administrators',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get users by level
     */
    public function getUsersByLevel(Request $request)
    {
        try {
            $user = $request->user();
            $levelFilter = $this->getAdminLevelFilter($request);

            $usersQuery = User::whereIn('role', ['lecturer', 'instructor', 'invigilator', 'technician']);

            if ($user->role === 'faculty_officer') {
                $usersQuery->whereHas('level', function($q) use ($user) {
                    $q->where('faculty_id', $user->faculty_id);
                });
            } elseif ($levelFilter !== null) {
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
     * Set global active session
     */
    public function setGlobalActiveSession(Request $request, $sessionId)
    {
        try {
            SystemConfig::setGlobalActiveSession($sessionId);
            return response()->json(['message' => 'Global active session set successfully']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get global active session
     */
    public function getGlobalActiveSession()
    {
        try {
            Log::info("getGlobalActiveSession called", ["session" => SystemConfig::getGlobalActiveSession()]);
            $session = SystemConfig::getGlobalActiveSession();
            if (!$session) {
                return response()->json(["error" => "No active session found"], 404);
            }
            return response()->json($session);
        } catch (Exception $e) {
            return response()->json(["error" => $e->getMessage()], 500);
        }
    }

    /**
     * Get courses for the current global active session
     */
    public function getActiveSessionCourses(Request $request)
    {
        try {
            $session = SystemConfig::getGlobalActiveSession();
            if (!$session) {
                Log::warning("getActiveSessionCourses: No global active session found in SystemConfig");
                return response()->json(["error" => "No active global session set"], 404);
            }

            $user = $request->user();
            $query = Course::whereHas("semester", function ($q) use ($session) {
                $q->where("acd_session_id", $session->id);
            });

            // Filter for level admin if applicable
            if ($user->role === "level_admin") {
                $query->where("created_by", $user->id);
            }

            $courses = $query->with(["semester", "lecturerCourses.user"])->get();
            
            // Add assigned_to name to each course for frontend convenience
            $courses->map(function($course) {
                $assignment = $course->lecturerCourses->first();
                $course->assigned_to = $assignment && $assignment->user ? $assignment->user->full_name : null;
                $course->assigned_to_id = $assignment ? $assignment->user_id : null;
                return $course;
            });
            
            Log::info("getActiveSessionCourses: Success", ["session_id" => $session->id, "course_count" => $courses->count()]);

            return response()->json([
                "session" => $session,
                "courses" => $courses
            ]);
        } catch (Exception $e) {
            Log::error("getActiveSessionCourses error: " . $e->getMessage());
            return response()->json(["error" => $e->getMessage()], 500);
        }
    }

    /**
     * Log an exam security violation
     */
    public function logViolation(Request $request)
    {
        try {
            $validate = $request->validate([
                'exam_id' => 'required|exists:exams,id',
                'student_id' => 'required|exists:students,id',
                'violation_type' => 'required|string',
                'details' => 'nullable|string',
                'severity' => 'required|in:low,medium,high,critical'
            ]);

            $violation = \App\Models\ExamViolation::create($validate);

            // Check total violations for this student in this exam
            $totalViolations = \App\Models\ExamViolation::where('exam_id', $validate['exam_id'])
                ->where('student_id', $validate['student_id'])
                ->count();

            $exam = Exam::find($validate['exam_id']);
            $maxViolations = $exam->max_violations ?? SystemConfig::get('max_violations', 3);

            $autoSubmitted = false;
            if ($totalViolations >= $maxViolations) {
                // Potential auto-submit logic here
                $autoSubmitted = true;
            }

            return response()->json([
                'message' => 'Violation logged successfully',
                'total_violations' => $totalViolations,
                'max_allowed' => $maxViolations,
                'auto_submitted' => $autoSubmitted
            ], 201);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get violations for an exam
     */
    public function getExamViolations($examId)
    {
        try {
            $violations = \App\Models\ExamViolation::where('exam_id', $examId)
                ->with('student')
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($violations);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get violations for a student
     */
    public function getStudentViolations($studentId)
    {
        try {
            $violations = \App\Models\ExamViolation::where('student_id', $studentId)
                ->with('exam.course')
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($violations);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update exam security settings
     */
    public function updateExamSecuritySettings(Request $request, $examId)
    {
        try {
            $exam = Exam::findOrFail($examId);
            $validate = $request->validate([
                'enable_browser_lockdown' => 'boolean',
                'enable_fullscreen' => 'boolean',
                'enable_copy_paste_block' => 'boolean',
                'enable_screenshot_block' => 'boolean',
                'enable_tab_switch_detection' => 'boolean',
                'enable_multiple_monitor_check' => 'boolean',
                'max_violations' => 'integer|min:1|max:10'
            ]);

            $exam->update($validate);
            return response()->json(['message' => 'Security settings updated successfully', 'exam' => $exam]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get exam security settings
     */
    public function getExamSecuritySettings($examId)
    {
        try {
            $exam = Exam::findOrFail($examId);
            return response()->json([
                'enable_browser_lockdown' => (bool)$exam->enable_browser_lockdown,
                'enable_fullscreen' => (bool)$exam->enable_fullscreen,
                'enable_copy_paste_block' => (bool)$exam->enable_copy_paste_block,
                'enable_screenshot_block' => (bool)$exam->enable_screenshot_block,
                'enable_tab_switch_detection' => (bool)$exam->enable_tab_switch_detection,
                'enable_multiple_monitor_check' => (bool)$exam->enable_multiple_monitor_check,
                'max_violations' => (int)($exam->max_violations ?? SystemConfig::get('max_violations', 3))
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get semesters for a specific session
     */
    public function getSessionSemesters(Request $request, $session_id)
    {
        try {
            $user = $request->user();
            Log::info('getSessionSemesters called', [
                'user_id' => $user->id,
                'user_role' => $user->role,
                'session_id' => $session_id
            ]);

            $query = Semester::where('acd_session_id', $session_id);

            // Apply role-based filtering
            if ($user->role === 'level_admin') {
                $query->where('created_by', $user->id);
            }

            $semesters = $query->orderBy('semester', 'asc')->get();

            Log::info('getSessionSemesters result', [
                'count' => $semesters->count()
            ]);

            return response()->json($semesters);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch semesters',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enroll students in a course
     */
    public function enrollStudents(Request $request)
    {
        try {
            $request->validate([
                'course_id' => 'required|exists:courses,id',
                'student_ids' => 'required|array',
                'student_ids.*' => 'exists:students,id'
            ]);

            $courseId = $request->course_id;
            $studentIds = $request->student_ids;
            $count = 0;

            foreach ($studentIds as $studentId) {
                $exists = StudentCourse::where('course_id', $courseId)
                    ->where('student_id', $studentId)
                    ->exists();

                if (!$exists) {
                    StudentCourse::create([
                        'course_id' => $courseId,
                        'student_id' => $studentId
                    ]);
                    $count++;
                }
            }

            return response()->json([
                'message' => "Successfully enrolled {$count} students"
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Unenroll a student from a course
     */
    public function unenrollStudent(Request $request)
    {
        try {
            $request->validate([
                'course_id' => 'required|exists:courses,id',
                'student_id' => 'required|exists:students,id'
            ]);

            StudentCourse::where('course_id', $request->course_id)
                ->where('student_id', $request->student_id)
                ->delete();

            return response()->json([
                'message' => 'Student unenrolled successfully'
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get students not enrolled in a specific course
     */
    public function getUnenrolledStudents(Request $request, $course_id)
    {
        try {
            $user = $request->user();
            $levelFilter = $this->getAdminLevelFilter($request);

            // Get IDs of students already enrolled
            $enrolledIds = StudentCourse::where('course_id', $course_id)
                ->pluck('student_id');

            $query = Student::whereNotIn('id', $enrolledIds);

            // Apply hierarchy filtering
            if ($user->role === 'faculty_officer') {
                $query->whereHas('level', function($q) use ($user) {
                    $q->where('faculty_id', $user->faculty_id);
                });
            } elseif ($levelFilter !== null) {
                $query->where('level_id', $levelFilter);
            }

            $students = $query->orderBy('full_name')->get();
            return response()->json($students);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Enroll all students of a specific level/department into a course
     */
    public function enrollStudentsByLevel(Request $request)
    {
        try {
            $request->validate([
                'course_id' => 'required|exists:courses,id',
                'level_id' => 'required|exists:acd_sessions,id'
            ]);

            $courseId = $request->course_id;
            $levelId = $request->level_id;

            // Get all students in this level
            $studentIds = Student::where('level_id', $levelId)->pluck('id');
            $count = 0;

            foreach ($studentIds as $studentId) {
                $exists = StudentCourse::where('course_id', $courseId)
                    ->where('student_id', $studentId)
                    ->exists();

                if (!$exists) {
                    StudentCourse::create([
                        'course_id' => $courseId,
                        'student_id' => $studentId
                    ]);
                    $count++;
                }
            }

            return response()->json([
                'message' => "Successfully enrolled {$count} students from the department"
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Import courses from Excel
     */
    public function importCourses(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|mimes:xlsx,xls,csv',
                'semester_id' => 'required|exists:semesters,id'
            ]);

            $semesterId = $request->semester_id;
            $semester = Semester::find($semesterId);
            
            Excel::import(new CoursesImport($semesterId, $semester->acd_session_id), $request->file('file'));

            return response()->json([
                'message' => 'Courses imported successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to import courses',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download sample import file for courses
     */
    public function downloadSampleCourseImport()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="sample_courses_import.csv"',
        ];

        $columns = ['Code', 'Title', 'Credit Unit'];
        $sampleData = [
            ['CSC101', 'Introduction to Computing', '3'],
            ['MTH101', 'General Mathematics I', '3'],
            ['GST101', 'Use of English', '2'],
        ];

        $callback = function () use ($columns, $sampleData) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($sampleData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
