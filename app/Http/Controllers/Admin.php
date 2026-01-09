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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\ExamArchive;
use App\Models\Question;
use App\Models\Answers;
use App\Models\ExamTicket;

class Admin extends Controller
{
    private function getAdminLevelFilter(Request $request)
    {
        $user = $request->user();
        if (!$user) return null;
        if ($user->role === 'super_admin') {
            $levelId = $request->query('level_id');
            return ($levelId && $levelId !== '' && $levelId !== 'all') ? $levelId : null;
        }
        if ($user->role === 'faculty_officer') return null;
        if ($user->role === 'level_admin') return $user->level_id;
        return null;
    }

    public function createAdminUser(Request $request)
    {
        try {
            $v = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8|confirmed',
            ]);
            $user = User::create([
                'full_name' => $v['full_name'],
                'email' => $v['email'],
                'password' => bcrypt($v['password']),
                'role' => 'admin',
                'status' => 'active',
            ]);
            return response()->json($user, 201);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function createSuperAdmin(Request $request)
    {
        try {
            $v = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
            ]);
            $user = User::create([
                'full_name' => $v['full_name'],
                'email' => $v['email'],
                'password' => bcrypt('password'),
                'role' => 'super_admin',
                'status' => 'active',
            ]);
            return response()->json(['message' => 'Super admin created', 'user' => $user], 201);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function createFacultyOfficer(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user || $user->role !== 'super_admin') return response()->json(['error' => 'Unauthorized'], 403);
            $v = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'faculty_id' => 'required|exists:faculties,id'
            ]);
            $newOfficer = User::create([
                'full_name' => $v['full_name'],
                'email' => $v['email'],
                'password' => bcrypt('password'),
                'role' => 'faculty_officer',
                'status' => 'active',
                'faculty_id' => $v['faculty_id'],
            ]);
            return response()->json(['message' => 'Faculty officer created', 'user' => $newOfficer], 201);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function createLevelAdmin(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user || !in_array($user->role, ['super_admin', 'faculty_officer'])) return response()->json(['error' => 'Unauthorized'], 403);
            $v = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'level_id' => 'required|exists:acd_sessions,id'
            ]);
            if ($user->role === 'faculty_officer') {
                if (!Acd_session::where(['id' => $v['level_id'], 'faculty_id' => $user->faculty_id])->exists()) {
                    return response()->json(['error' => 'Department not found in your faculty'], 403);
                }
            }
            $dept = Acd_session::find($v['level_id']);
            $newOfficer = User::create([
                'full_name' => $v['full_name'],
                'email' => $v['email'],
                'password' => bcrypt('password'),
                'role' => 'level_admin',
                'status' => 'active',
                'level_id' => $v['level_id'],
                'faculty_id' => $dept->faculty_id,
            ]);
            return response()->json(['message' => 'Department officer created', 'user' => $newOfficer], 201);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getAdmins(Request $request)
    {
        $user = $request->user();
        $query = User::whereIn('role', ['super_admin', 'level_admin', 'admin', 'faculty_officer'])->with(['level', 'faculty']);
        if ($user->role === 'faculty_officer') $query->where('faculty_id', $user->faculty_id);
        return response()->json($query->orderBy('full_name')->get());
    }

    public function updateAdmin(Request $request, $adminId)
    {
        try {
            $admin = User::findOrFail($adminId);
            $v = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $adminId,
                'role' => 'required|in:super_admin,level_admin,faculty_officer',
                'level_id' => 'nullable|exists:acd_sessions,id',
                'faculty_id' => 'nullable|exists:faculties,id',
                'status' => 'required|in:active,inactive,suspended'
            ]);
            $admin->update($v);
            return response()->json($admin);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteAdmin($adminId)
    {
        try {
            User::findOrFail($adminId)->delete();
            return response()->json(['message' => 'Administrator deleted']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function resetAdminPassword($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->update(['password' => bcrypt('password')]);
            return response()->json(['message' => 'Password reset successful']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function importAdmins(Request $request)
    {
        try {
            $request->validate(['file' => 'required|mimes:xlsx,xls,csv']);
            Excel::import(new \App\Imports\AdminsImport, $request->file('file'));
            return response()->json(['message' => 'Admins imported successfully']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function downloadSampleImportFile()
    {
        $headers = ['Content-Type' => 'text/csv', 'Content-Disposition' => 'attachment; filename="sample_admins_import.csv"'];
        $columns = ['Full Name', 'Email', 'Role', 'Level ID (Optional)', 'Faculty ID (Optional)'];
        $sampleData = [['John Doe', 'john@example.com', 'level_admin', '1', ''], ['Jane Smith', 'jane@example.com', 'super_admin', '', ''], ['Alice Faculty', 'alice@example.com', 'faculty_officer', '', '1']];
        $callback = function () use ($columns, $sampleData) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($sampleData as $row) fputcsv($file, $row);
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }

    public function get_system_settings()
    {
        return response()->json([
            'student_see_result' => SystemConfig::get('student_see_result', false),
            'student_registration_enabled' => SystemConfig::get('student_registration_enabled', true),
            'enable_browser_lockdown' => SystemConfig::get('enable_browser_lockdown', true),
            'enable_fullscreen' => SystemConfig::get('enable_fullscreen', true),
            'enable_tab_switch_detection' => SystemConfig::get('enable_tab_switch_detection', true),
            'enable_copy_paste_block' => SystemConfig::get('enable_copy_paste_block', true),
            'enable_screenshot_block' => SystemConfig::get('enable_screenshot_block', true),
            'enable_multiple_monitor_check' => SystemConfig::get('enable_multiple_monitor_check', true),
            'max_violations' => SystemConfig::get('max_violations', 3),
        ]);
    }

    public function update_system_setting(Request $request)
    {
        try {
            if ($request->user()->role !== 'super_admin') return response()->json(['error' => 'Unauthorized'], 403);
            $v = $request->validate(['key' => 'required|string', 'value' => 'required']);
            SystemConfig::set($v['key'], $v['value']);
            return response()->json(['message' => 'Setting updated']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function add_acd_session(Request $request)
    {
        $v = $request->validate(['title' => ['required', 'string', 'regex:/^\d{4}\/\d{4}$/'], 'status' => 'string']);
        try {
            $acd_session = Acd_session::create($v);
            return response()->json($acd_session, 201);
        } catch (QueryException $e) {
            if (isset($e->errorInfo[0]) && $e->errorInfo[0] == 23505) return response()->json('session already exist', 404);
            return response()->json($e->getMessage(), 500);
        } catch (Exception $e) {
            return response()->json($e->getMessage(), 500);
        }
    }

    public function get_acd_sessions()
    {
        return response()->json(Acd_session::where('title', 'LIKE', '%/%')->orderBy('title')->get());
    }

    public function get_acd_session($session_id)
    {
        return response()->json(Acd_session::findOrFail($session_id));
    }

    public function activate_session($session_id)
    {
        try {
            Acd_session::query()->update(['status' => 'inactive']);
            $session = Acd_session::findOrFail($session_id);
            Semester::query()->update(['status' => 'inactive']);
            $session->update(['status' => 'active']);
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
            $session->update(['status' => 'inactive']);
            Semester::where('acd_session_id', $session_id)->update(['status' => 'inactive']);
            return response()->json($session);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function activate_semester($semester_id)
    {
        try {
            Semester::query()->update(['status' => 'inactive']);
            $semester = Semester::findOrFail($semester_id);
            $semester->update(['status' => 'active']);
            return response()->json($semester);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function add_semester(Request $request, $session_id)
    {
        $v = $request->validate(['semester' => 'string|required', 'status' => 'string|required']);
        try {
            $user = $request->user();
            if (Semester::where(['acd_session_id' => $session_id, 'semester' => $v['semester'], 'created_by' => $user->id])->exists()) {
                return response()->json(['error' => 'Already exists'], 400);
            }
            $semester = Semester::create(['acd_session_id' => $session_id, 'semester' => $v['semester'], 'status' => $v['status'], 'created_by' => $user->id]);
            return response()->json($semester, 201);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function get_semester($semester_id)
    {
        $semester = Semester::findOrFail($semester_id);
        return response()->json(['semester' => $semester, 'courses' => $semester->courses]);
    }

    public function getSessionSemesters(Request $request, $acd_session_id)
    {
        $user = $request->user();
        $query = Acd_session::findOrFail($acd_session_id)->semesters();
        if ($user && $user->role === 'level_admin') $query->where('created_by', $user->id);
        return response()->json($query->with('courses')->get());
    }

    public function add_course(Request $request, $semester_id)
    {
        $v = $request->validate(['title' => 'required|string', 'code' => 'required|string', 'credit_unit' => 'required|string']);
        try {
            $user = $request->user();
            if (Course::where('code', $v['code'])->exists()) return response()->json(['error' => "Code exists"], 400);
            $semester = Semester::findOrFail($semester_id);
            if ($user->role === 'level_admin' && $semester->created_by !== $user->id) return response()->json(['error' => 'Unauthorized'], 403);
            $course = Course::create(['semester_id' => $semester_id, 'title' => $v['title'], 'code' => $v['code'], 'credit_unit' => $v['credit_unit'], 'created_by' => $user->id]);
            return response()->json($course, 201);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function get_courses()
    {
        $user = request()->user();
        $query = Course::query();
        if ($user && $user->role === 'level_admin') $query->where('created_by', $user->id);
        elseif ($user && $user->role === 'faculty_officer') $query->whereHas('semester.acdSession', fn($q) => $q->where('faculty_id', $user->faculty_id));
        return response()->json($query->get());
    }

    public function get_course($course_id)
    {
        return response()->json(Course::findOrFail($course_id));
    }

    public function get_semester_courses($semester_id)
    {
        return response()->json(Semester::findOrFail($semester_id)->courses);
    }

    public function get_active_session()
    {
        $session = Acd_session::where('status', 'active')->first();
        if (!$session) return response()->json(null);
        $semester = $session->semesters()->where('status', 'active')->first();
        if (!$semester) return response()->json([]);
        return response()->json($semester->courses);
    }

    public function add_lecturer_course(Request $request, $user_id, $course_id)
    {
        try {
            $currentUser = $request->user();
            $course = Course::findOrFail($course_id);
            $user = User::findOrFail($user_id);
            if ($currentUser->role === 'level_admin') {
                if ($course->created_by !== $currentUser->id || $user->level_id !== $currentUser->level_id) return response()->json(['error' => 'Unauthorized'], 403);
            }
            if (LecturerCourse::where(['user_id' => $user_id, 'course_id' => $course_id])->exists()) return response()->json(['error' => 'Already assigned'], 400);
            $lc = LecturerCourse::create(['user_id' => $user->id, 'course_id' => $course->id, 'title' => $course->title, 'code' => $course->code, 'credit_unit' => $course->credit_unit, 'status' => 'active', 'created_by' => $currentUser->id]);
            return response()->json($lc, 201);
        } catch (Exception $err) {
            return response()->json(['error' => $err->getMessage()], 500);
        }
    }

    public function get_exams(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);
            $query = Exam::query();
            if ($user->role === 'level_admin') {
                $query->where(fn($q) => $q->whereHas('course.semester.acdSession', fn($sq) => $sq->where('id', $user->level_id))->orWhereHas('course', fn($sq) => $sq->where('created_by', $user->id)));
            } elseif ($user->role === "faculty_officer") {
                $faculty_id = $user->faculty_id;
                $query->where(fn($q) => $q->whereIn("level_id", fn($sub) => $sub->select("id")->from("acd_sessions")->where("faculty_id", $faculty_id))
                    ->orWhereIn("user_id", fn($sub) => $sub->select("id")->from("users")->where("faculty_id", $faculty_id)->orWhereIn("level_id", fn($sub2) => $sub2->select("id")->from("acd_sessions")->where("faculty_id", $faculty_id)))
                    ->orWhereHas("course", fn($cq) => $cq->whereIn("created_by", fn($sub) => $sub->select("id")->from("users")->where("faculty_id", $faculty_id)->orWhereIn("level_id", fn($sub2) => $sub2->select("id")->from("acd_sessions")->where("faculty_id", $faculty_id)))));
            }
            return response()->json($query->with("course")->get());
        } catch (Exception $e) {
            return response()->json(["error" => $e->getMessage()], 500);
        }
    }

    public function get_exam_tickets($exam_id)
    {
        try {
            $exam = Exam::findOrFail($exam_id);
            $tickets = ExamTicket::where('exam_id', $exam_id)->with(['student' => fn($q) => $q->select('id', 'candidate_no', 'full_name', 'department', 'programme')])->orderBy('is_used')->orderBy('ticket_no')->get()
                ->map(fn($t) => [
                    'id' => $t->id, 'ticket_no' => $t->ticket_no, 'is_used' => $t->is_used, 'status' => $t->is_used ? 'Used' : 'Available', 'assigned_to_student_id' => $t->assigned_to_student_id,
                    "assigned_at" => $t->assigned_at ? $t->assigned_at->toIso8601String() : null, "student" => $t->student ? $t->student->toArray() : null,
                    "created_at" => $t->created_at ? $t->created_at->toIso8601String() : null, "updated_at" => $t->updated_at ? $t->updated_at->toIso8601String() : null,
                ]);
            return response()->json(['exam' => $exam, 'statistics' => ['total' => $tickets->count(), 'available' => $tickets->where('is_used', false)->count(), 'used' => $tickets->where('is_used', true)->count()], 'tickets' => $tickets]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function activate_exam(Request $request, $exam_id)
    {
        try {
            $exam = Exam::with('course.semester')->findOrFail($exam_id);
            $exam->update(['activated' => 'yes', 'activated_date' => now(), 'invigilator' => $request->invigilator]);
            $user = $request->user();
            if ($user->role === 'level_admin') $exam->update(['level_id' => $user->level_id]);
            elseif (in_array($user->role, ["faculty_officer", "super_admin"])) {
                $creator = User::find($exam->user_id) ?? ($exam->course ? User::find($exam->course->created_by) : null);
                if ($creator && $creator->level_id) $exam->update(['level_id' => $creator->level_id]);
            }
            $ticketsGenerated = 0;
            if ($course = $exam->course) {
                foreach ($course->studentCourses as $sc) {
                    if ($student = Student::find($sc->student_id)) {
                        if (!ExamTicket::where(['exam_id' => $exam_id, 'assigned_to_student_id' => $student->id])->exists()) {
                            ExamTicket::create(['exam_id' => $exam->id, 'ticket_no' => ExamTicket::generateUniqueTicketNumber($exam->id), 'is_used' => false]);
                            $ticketsGenerated++;
                        }
                    }
                }
            }
            return response()->json(['exam' => $exam, 'tickets_generated' => $ticketsGenerated]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function terminate_exam($exam_id)
    {
        try {
            $exam = Exam::findOrFail($exam_id);
            $course = Course::findOrFail($exam->course_id);
            $totalQuestions = Question::where('exam_id', $exam_id)->count();
            $results = Student::whereHas('candidates', fn($q) => $q->where('exam_id', $exam_id))->with(['candidates' => fn($q) => $q->where('exam_id', $exam_id), 'examScores' => fn($q) => $q->where('course_id', $exam->course_id)])->get()
                ->map(fn($s) => [
                    'student_id' => $s->id, 'candidate_no' => $s->candidate_no, 'full_name' => $s->full_name, 'department' => $s->department, 'programme' => $s->programme, 'level_id' => $s->level_id, 'score' => $s->examScores->first() ? $s->examScores->first()->score : 0,
                    'submission_time' => $s->candidates->first() ? $s->candidates->first()->created_at : null,
                    'questions_answered' => Answers::where(['course_id' => $exam->course_id, 'candidate_id' => $s->id])->count(),
                    'correct_answers' => Answers::where(['course_id' => $exam->course_id, 'candidate_id' => $s->id, 'is_correct' => true])->count(),
                ])->toArray();
            ExamArchive::create(['exam_id' => $exam_id, 'exam_title' => $exam->title ?? $course->title . ' Exam', 'course_title' => $course->title, 'exam_date' => $exam->activated_date, 'duration' => $exam->exam_duration, 'total_questions' => $totalQuestions, 'marks_per_question' => $exam->marks_per_question, 'total_marks' => $exam->marks_per_question * $totalQuestions, 'student_results' => $results]);
            $studentIds = Candidate::where('exam_id', $exam_id)->pluck('student_id')->toArray();
            if (!empty($studentIds)) Student::whereIn('id', $studentIds)->update(['is_logged_on' => 'no', 'is_checked_in' => false]);
            Candidate::where('exam_id', $exam_id)->delete();
            ExamTicket::where('exam_id', $exam_id)->delete();
            $exam->update(['activated' => 'no', 'invigilator' => null, 'finished_time' => now()]);
            return response()->json(['message' => 'Terminated']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function register_student(Request $request)
    {
        try {
            $validate = $request->validate([
                'candidate_no' => 'required|string|unique:students,candidate_no',
                'full_name' => 'required|string',
                'department' => 'required|string',
                'programme' => 'required|string',
                'level_id' => 'nullable|exists:acd_sessions,id',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);
            
            $user = $request->user();
            $levelId = $request->input('level_id');
            if ($user->role === 'level_admin') $levelId = $user->level_id;
            elseif (!$levelId) $levelId = $this->getAdminLevelFilter($request);
            
            $imagePath = null;
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('uploads/students'), $imageName);
                $imagePath = 'uploads/students/' . $imageName;
            }
            
            $student = Student::create([
                'candidate_no' => $validate['candidate_no'],
                'full_name' => $validate['full_name'],
                'department' => $validate['department'],
                'programme' => $validate['programme'],
                'password' => bcrypt($request->password ?? 'password'),
                'level_id' => $levelId,
                'is_logged_on' => 'no',
                'image' => $imagePath
            ]);

            $activeExam = Exam::where('activated', 'yes')->latest()->first();
            if ($activeExam) {
                $isEnrolled = \App\Models\StudentCourse::where(['student_id' => $student->id, 'course_id' => $activeExam->course_id])->exists();
                if ($isEnrolled && !Candidate::where(['student_id' => $student->id, 'exam_id' => $activeExam->id])->exists()) {
                    Candidate::create([
                        'student_id' => $student->id, 'exam_id' => $activeExam->id, 'full_name' => $student->full_name,
                        'programme' => $student->programme, 'department' => $student->department,
                        'password' => $student->password, 'is_logged_on' => 0, 'is_checkout' => 0,
                        'checkin_time' => now(), 'ticket_no' => str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT), 'status' => 'pending',
                    ]);
                }
            }
            
            return response()->json($student, 201);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function update_student(Request $request, $student_id)
    {
        try {
            $student = Student::findOrFail($student_id);
            $request->validate([
                "candidate_no" => "nullable|string|max:50|unique:students,candidate_no," . $student_id,
                "full_name" => "nullable|string|max:255",
                "department" => "nullable|string|max:255",
                "programme" => "nullable|string|max:255",
                "image" => "nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048",
            ]);

            if ($request->hasFile("image")) {
                if ($student->image && file_exists(public_path($student->image))) {
                    @unlink(public_path($student->image));
                }
                $image = $request->file("image");
                $imageName = time() . "_" . $image->getClientOriginalName();
                $image->move(public_path("uploads/students"), $imageName);
                $student->image = "uploads/students/" . $imageName;
            }

            if ($request->has("candidate_no")) $student->candidate_no = $request->candidate_no;
            if ($request->has("full_name")) $student->full_name = $request->full_name;
            if ($request->has("department")) $student->department = $request->department;
            if ($request->has("programme")) $student->programme = $request->programme;
            if ($request->has("password")) $student->password = bcrypt($request->password);

            $student->save();
            return response()->json(["message" => "Student updated successfully", "student" => $student], 200);
        } catch (Exception $e) {
            return response()->json(["error" => $e->getMessage()], 500);
        }
    }


    public function getStudentsByLevel(Request $request)
    {
        try {
            $user = $request->user();
            $query = Student::with('level');
            $lvl = $request->query("level_id");
            if ($user->role === "faculty_officer") {
                $query->whereHas("level", fn($q) => $q->where("faculty_id", $user->faculty_id));
                if ($lvl && $lvl !== "all") $query->where("level_id", $lvl);
            } elseif ($user->role === "super_admin") {
                if ($lvl && $lvl !== "all") $query->where("level_id", $lvl);
            } elseif ($user->role === "level_admin") {
                $query->where("level_id", $user->level_id);
            }
            $students = $query->latest()->get();
            $exam = Exam::where('activated', 'yes')->latest()->first();
            if ($exam) {
                foreach ($students as $s) {
                    $c = Candidate::where(['student_id' => $s->id, 'exam_id' => $exam->id])->first();
                    $s->ticket_no = $c ? $c->ticket_no : null;
                    $s->time_extension = $c ? $c->time_extension : 0;
                    $s->exam_id = $exam->id;
                }
            }
            return response()->json($students);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getUsersByLevel(Request $request)
    {
        try {
            $user = $request->user();
            $query = User::query();
            $lvl = $request->query("level_id");

            if ($user->role === "faculty_officer") {
                $query->where(function($q) use ($user) {
                    $q->where("faculty_id", $user->faculty_id)
                      ->orWhereHas("level", fn($sq) => $sq->where("faculty_id", $user->faculty_id));
                });
                if ($lvl && $lvl !== "all") $query->where("level_id", $lvl);
            } elseif ($user->role === "super_admin") {
                if ($lvl && $lvl !== "all") $query->where("level_id", $lvl);
            } elseif ($user->role === "level_admin") {
                $query->where("level_id", $user->level_id);
            }

            $users = $query->orderBy("full_name")->get();
            return response()->json($users);
        } catch (Exception $e) {
            return response()->json(["error" => $e->getMessage()], 500);
        }
    }

    public function getExamsByLevel(Request $request)
    {
        try {
            $user = $request->user();
            $query = Exam::with(['course', 'level']);
            $lvl = $request->query("level_id");

            if ($user->role === "faculty_officer") {
                $faculty_id = $user->faculty_id;
                $query->where(function($q) use ($faculty_id) {
                    $q->whereIn("level_id", function($sub) use ($faculty_id) {
                        $sub->select("id")->from("acd_sessions")->where("faculty_id", $faculty_id);
                    })
                    ->orWhereIn("user_id", function($sub) use ($faculty_id) {
                        $sub->select("id")->from("users")
                            ->where("faculty_id", $faculty_id)
                            ->orWhereIn("level_id", function($sub2) use ($faculty_id) {
                                $sub2->select("id")->from("acd_sessions")->where("faculty_id", $faculty_id);
                            });
                    })
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
                if ($lvl && $lvl !== "all") $query->where("level_id", $lvl);
            } elseif ($user->role === "super_admin") {
                if ($lvl && $lvl !== "all") $query->where("level_id", $lvl);
            } elseif ($user->role === "level_admin") {
                $query->where("level_id", $user->level_id);
            }

            $exams = $query->latest()->get();
            return response()->json($exams);
        } catch (Exception $e) {
            return response()->json(["error" => $e->getMessage()], 500);
        }
    }

    public function upload_excel(Request $request)
    {
        try {
            $request->validate(["excel_file" => "required|mimes:xlsx,xls"]);
            $levelId = $request->input("level_id") ?? $this->getAdminLevelFilter($request);
            Excel::import(new \App\Imports\StudentsImport($levelId), $request->file("excel_file"));
            return response()->json(["message" => "File imported"], 201);
        } catch (Exception $e) {
            return response()->json(["error" => $e->getMessage()], 500);
        }
    }

    public function upload_instructors_excel(Request $request)
    {
        try {
            $request->validate(['excel_file' => 'required|mimes:xlsx,xls']);
            $file = $request->file('excel_file');
            $reader = ReaderEntityFactory::createXLSXReader();
            $reader->open($file->getPathname());
            $user = $request->user();
            foreach ($reader->getSheetIterator() as $sheet) {
                foreach ($sheet->getRowIterator() as $index => $row) {
                    if ($index === 1) continue;
                    $cells = $row->getCells();
                    if (count($cells) < 3) continue;
                    $data = [
                        'full_name' => $cells[0]->getValue(),
                        'email' => $cells[1]->getValue(),
                        'password' => bcrypt($cells[2]->getValue() ?? 'password'),
                        'role' => isset($cells[3]) ? $cells[3]->getValue() : 'lecturer',
                        'status' => isset($cells[4]) ? $cells[4]->getValue() : 'active',
                    ];
                    if ($user->role === 'level_admin') $data['level_id'] = $user->level_id;
                    User::create($data);
                }
            }
            $reader->close();
            return response()->json(['message' => 'Instructors imported']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update_instructor_status(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            $user->update(['status' => $request->status]);
            return response()->json($user);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getDashboardStats(Request $request)
    {
        try {
            $user = $request->user();
            if ($user && $user->role === 'faculty_officer') {
                $fid = $user->faculty_id;
                return response()->json([
                    'total_students' => Student::whereHas('level', fn($q) => $q->where('faculty_id', $fid))->count(),
                    'active_courses' => Course::whereHas('semester.acdSession', fn($q) => $q->where('faculty_id', $fid))->count(),
                    'total_instructors' => User::where('role', 'lecturer')->whereHas('level', fn($q) => $q->where('faculty_id', $fid))->count(),
                    'academic_sessions' => Acd_session::where('title', 'LIKE', '%/%')->where('status', 'active')->count(),
                ]);
            }
            return response()->json([
                'total_students' => Student::count(),
                'active_courses' => Course::count(),
                'total_instructors' => User::where('role', 'lecturer')->count(),
                'academic_sessions' => Acd_session::count(),
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function get_invigilators(Request $request)
    {
        $user = $request->user();
        $query = User::where('role', 'technician');
        if ($user->role === 'level_admin') $query->where('level_id', $user->level_id);
        elseif ($user->role === 'faculty_officer') $query->where(fn($q) => $q->whereHas('level', fn($sq) => $sq->where('faculty_id', $user->faculty_id))->orWhere('faculty_id', $user->faculty_id));
        $assigned = Exam::where('activated', 'yes')->whereNotNull('invigilator')->pluck('invigilator')->toArray();
        return response()->json($query->get()->filter(fn($i) => !in_array($i->email, $assigned) && !in_array($i->id, $assigned))->values());
    }

    public function get_invigilator($invigilator_id)
    {
        $i = User::findOrFail($invigilator_id);
        $exam = Exam::where('activated', 'yes')->where(fn($q) => $q->where('invigilator', $i->email)->orWhere('invigilator', $i->id))->first();
        if ($exam && $c = Course::find($exam->course_id)) $exam->course = $c->title;
        return response()->json(['Invigilator' => $i, 'exam' => $exam, 'examAssigned' => !!$exam]);
    }

    public function get_current_exam(Request $request)
    {
        $user = $request->user();
        $query = Exam::query();
        if ($user->role === 'level_admin') $query->where(fn($q) => $q->whereHas('course.semester.acdSession', fn($sq) => $sq->where('id', $user->level_id))->orWhere('level_id', $user->level_id));
        elseif ($user->role === 'faculty_officer') $query->whereHas('course.semester.acdSession', fn($q) => $q->where('faculty_id', $user->faculty_id));
        $exam = (clone $query)->where('activated', 'yes')->latest()->first() ?? $query->latest()->first();
        if (!$exam) return response()->json(['message' => 'Not found'], 404);
        $exam->course = Course::find($exam->course_id)->title;
        return response()->json($exam);
    }

    public function getExamArchives(Request $request)
    {
        $user = $request->user();
        $query = ExamArchive::query();
        if ($user->role === 'faculty_officer') $query->whereHas('exam', fn($q) => $q->whereHas('course.semester.acdSession', fn($sq) => $sq->where('faculty_id', $user->faculty_id)));
        elseif ($lvl = $this->getAdminLevelFilter($request)) $query->whereHas('exam', fn($q) => $q->where('level_id', $lvl));
        return response()->json($query->with('exam')->latest()->get());
    }

    public function getExamArchive(Request $request, $archive_id)
    {
        try {
            $archive = ExamArchive::with('exam')->findOrFail($archive_id);
            $user = $request->user();
            if ($user->role === "level_admin") {
                $results = collect($archive->student_results);
                $filteredResults = $results->filter(function($r) use ($user) {
                    if (isset($r["level_id"])) return $r["level_id"] == $user->level_id;
                    $student = Student::find($r["student_id"]);
                    return $student && $student->level_id == $user->level_id;
                })->values()->all();
                $archive->student_results = $filteredResults;
            } elseif ($user->role === "faculty_officer") {
                $results = collect($archive->student_results);
                $filteredResults = $results->filter(function($r) use ($user) {
                    if (isset($r["level_id"])) {
                        $dept = Acd_session::find($r["level_id"]);
                        return $dept && $dept->faculty_id == $user->faculty_id;
                    }
                    $student = Student::with("level")->find($r["student_id"]);
                    return $student && $student->level && $student->level->faculty_id == $user->faculty_id;
                })->values()->all();
                $archive->student_results = $filteredResults;
            }
            return response()->json($archive);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function resetStudentLogin($studentId)
    {
        try {
            $student = Student::findOrFail($studentId);
            $student->update([
                'is_logged_on' => 'no',
                'is_checked_in' => true, // Allow them to login again
                'checkout_time' => null
            ]);

            // Also reset the candidate record if it exists for the current active exam
            $activeExam = Exam::where('activated', 'yes')->latest()->first();
            if ($activeExam) {
                Candidate::where('student_id', $studentId)
                    ->where('exam_id', $activeExam->id)
                    ->update([
                        'is_checkout' => 0,
                        'status' => 'active',
                        'checkout_time' => null,
                        'is_checked_in' => true
                    ]);
            }

            return response()->json(['message' => 'Student login status and check-in reset successfully']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function extendStudentTime(Request $request)
    {
        $v = $request->validate(['student_id' => 'required', 'exam_id' => 'required', 'minutes' => 'required|integer']);
        $c = Candidate::where(['student_id' => $v['student_id'], 'exam_id' => $v['exam_id']])->firstOrFail();
        $exam = Exam::findOrFail($v['exam_id']);
        $ext = (int)($c->time_extension ?? 0) + (int)$v['minutes'];
        if ($c->start_time) {
            $elap = now()->diffInSeconds(Carbon::parse($c->start_time));
            $allow = ($exam->exam_duration + (int)($c->time_extension ?? 0)) * 60;
            if ($elap > $allow) $ext += (int)ceil(($elap - $allow) / 60);
        }
        $c->update(['time_extension' => $ext, 'status' => 'active']);
        Student::where('id', $v['student_id'])->update(['is_logged_on' => 'no']);
        return response()->json(['message' => 'Extended', 'total_extension' => $ext]);
    }

    public function addCourseToActiveSession(Request $request)
    {
        $v = $request->validate(['title' => 'required', 'code' => 'required|unique:courses,code', 'credit_unit' => 'required', 'semester_id' => 'required']);
        $sem = Semester::findOrFail($v['semester_id']);
        $c = Course::create(array_merge($v, ['acd_session_id' => $sem->acd_session_id, 'created_by' => $request->user()->id]));
        return response()->json($c, 201);
    }

    public function assignCourseToLecturer(Request $request)
    {
        $v = $request->validate(['course_id' => 'required', 'lecturer_id' => 'required']);
        $c = Course::findOrFail($v['course_id']);
        LecturerCourse::where('course_id', $c->id)->delete();
        $lc = LecturerCourse::create(['user_id' => $v['lecturer_id'], 'course_id' => $c->id, 'title' => $c->title, 'code' => $c->code, 'credit_unit' => $c->credit_unit, 'status' => 'active', 'created_by' => $request->user()->id]);
        return response()->json($lc, 201);
    }

    public function setGlobalActiveSession(Request $request, $sessionId)
    {
        try {
            SystemConfig::setGlobalActiveSession($sessionId);
            return response()->json(["message" => "Global active session set successfully"]);
        } catch (Exception $e) {
            return response()->json(["error" => $e->getMessage()], 500);
        }
    }

    public function getGlobalActiveSession()
    {
        try {
            $session = SystemConfig::getGlobalActiveSession();
            if (!$session) {
                return response()->json(["error" => "No active session found"], 404);
            }
            return response()->json($session);
        } catch (Exception $e) {
            return response()->json(["error" => $e->getMessage()], 500);
        }
    }

    public function getActiveSessionCourses(Request $request)
    {
        $ses = SystemConfig::getGlobalActiveSession();
        if (!$ses) return response()->json(['error' => 'No session'], 404);
        $user = $request->user();
        $q = Course::whereHas('semester', fn($sq) => $sq->where('acd_session_id', $ses->id));
        if ($user->role === 'level_admin') $q->where('created_by', $user->id);
        $courses = $q->with(['semester', 'lecturerCourses.user'])->get()->map(function($c) {
            $a = $c->lecturerCourses->first();
            $c->assigned_to = $a && $a->user ? $a->user->full_name : null;
            $c->assigned_to_id = $a ? $a->user_id : null;
            return $c;
        });
        return response()->json(['session' => $ses, 'courses' => $courses]);
    }

    public function importCourses(Request $request)
    {
        try {
            $v = $request->validate(['file' => 'required|mimes:xlsx,xls,csv', 'semester_id' => 'required|exists:semesters,id']);
            $sem = Semester::find($v['semester_id']);
            Excel::import(new \App\Imports\CoursesImport($v['semester_id'], $sem->acd_session_id), $request->file('file'));
            return response()->json(['message' => 'Courses imported']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function downloadSampleCourseImport()
    {
        $headers = ['Content-Type' => 'text/csv', 'Content-Disposition' => 'attachment; filename="sample_courses_import.csv"'];
        $columns = ['Code', 'Title', 'Credit Unit'];
        $sampleData = [['CSC101', 'Intro to Comp', '3'], ['MTH101', 'Math I', '3']];
        $callback = function () use ($columns, $sampleData) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($sampleData as $row) fputcsv($file, $row);
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }

    public function enrollStudents(Request $request)
    {
        try {
            $v = $request->validate(['course_id' => 'required|exists:courses,id', 'student_ids' => 'required|array']);
            foreach ($v['student_ids'] as $sid) {
                \App\Models\StudentCourse::firstOrCreate(['course_id' => $v['course_id'], 'student_id' => $sid]);
            }
            return response()->json(['enrolled_count' => count($v['student_ids'])]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function unenrollStudent(Request $request)
    {
        try {
            $v = $request->validate(['course_id' => 'required', 'student_id' => 'required']);
            \App\Models\StudentCourse::where($v)->delete();
            return response()->json(['message' => 'Unenrolled']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getUnenrolledStudents(Request $request, $course_id)
    {
        try {
            $enrolled = \App\Models\StudentCourse::where('course_id', $course_id)->pluck('student_id');
            $user = $request->user();
            $query = Student::whereNotIn('id', $enrolled);
            if ($user->role === 'faculty_officer') $query->whereHas('level', fn($q) => $q->where('faculty_id', $user->faculty_id));
            elseif ($lvl = $this->getAdminLevelFilter($request)) $query->where('level_id', $lvl);
            return response()->json($query->orderBy('full_name')->get());
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function enrollStudentsByLevel(Request $request)
    {
        try {
            $v = $request->validate(['course_id' => 'required', 'level_id' => 'required']);
            $sids = Student::where('level_id', $v['level_id'])->pluck('id');
            foreach ($sids as $sid) {
                \App\Models\StudentCourse::firstOrCreate(['course_id' => $v['course_id'], 'student_id' => $sid]);
            }
            return response()->json(['enrolled_count' => $sids->count()]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getExamViolations($examId)
    {
        return response()->json(\App\Models\ExamViolation::where('exam_id', $examId)->with('student')->latest()->get());
    }

    public function getStudentViolations($studentId)
    {
        return response()->json(\App\Models\ExamViolation::where('student_id', $studentId)->with('exam.course')->latest()->get());
    }

    public function logViolation(Request $request)
    {
        try {
            $v = $request->validate(['exam_id' => 'required', 'student_id' => 'required', 'violation_type' => 'required', 'severity' => 'required']);
            $violation = \App\Models\ExamViolation::create($v);
            return response()->json($violation, 201);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getExamSecuritySettings($examId)
    {
        $e = Exam::findOrFail($examId);
        return response()->json(['enable_browser_lockdown' => (bool)$e->enable_browser_lockdown, 'enable_fullscreen' => (bool)$e->enable_fullscreen, 'enable_copy_paste_block' => (bool)$e->enable_copy_paste_block, 'enable_screenshot_block' => (bool)$e->enable_screenshot_block, 'enable_tab_switch_detection' => (bool)$e->enable_tab_switch_detection, 'enable_multiple_monitor_check' => (bool)$e->enable_multiple_monitor_check, 'max_violations' => (int)($e->max_violations ?? 3)]);
    }

    public function updateExamSecuritySettings(Request $request, $examId)
    {
        try {
            $e = Exam::findOrFail($examId);
            $e->update($request->all());
            return response()->json(['message' => 'Updated']);
        } catch (Exception $ex) {
            return response()->json(['error' => $ex->getMessage()], 500);
        }
    }

    public function getUpcomingExams()
    {
        return response()->json(Exam::where('submission_status', 'submitted')->where('activated', 'no')->latest()->limit(5)->get());
    }

    public function getRecentSubmissions()
    {
        return response()->json(Candidate::with('student', 'exam')->orderBy('updated_at', 'desc')->limit(5)->get());
    }

    public function getExamSubmissions(Request $request)
    {
        try {
            $user = $request->user();
            $query = Candidate::with(['student', 'exam.course'])->orderBy('updated_at', 'desc');
            if ($user->role === 'level_admin') {
                $cids = LecturerCourse::where('created_by', $user->id)->pluck('course_id');
                $eids = Exam::whereIn('course_id', $cids)->pluck('id');
                $query->whereIn('exam_id', $eids);
            } elseif ($user->role === 'faculty_officer') {
                $query->whereHas('exam.course.semester.acdSession', fn($q) => $q->where('faculty_id', $user->faculty_id));
            }
            return response()->json($query->get()->map(fn($s) => ['id' => $s->id, 'student' => ['full_name' => $s->student->full_name ?? 'N/A', 'candidate_no' => $s->student->candidate_no ?? 'N/A'], 'course' => ['title' => $s->exam->course->title ?? 'N/A'], 'exam' => ['exam_type' => $s->exam->exam_type ?? 'N/A'], 'score' => $s->score ?? 0, 'submitted_at' => $s->updated_at]));
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function get_course_students($course_id)
    {
        try {
            $course = Course::findOrFail($course_id);
            $students = [];
            foreach ($course->studentCourses as $sc) {
                if ($s = Student::find($sc->student_id)) $students[] = $s;
            }
            return response()->json($students);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function changePassword(Request $request)
    {
        $v = $request->validate(['current_password' => 'required', 'new_password' => 'required|min:6|confirmed']);
        if (!Hash::check($v['current_password'], $request->user()->password)) return response()->json(['error' => 'Invalid password'], 400);
        $request->user()->update(['password' => bcrypt($v['new_password'])]);
        return response()->json(['message' => 'Changed']);
    }
}
