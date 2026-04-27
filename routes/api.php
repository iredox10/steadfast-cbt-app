<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Instructor;
use App\Http\Controllers\InvigilatorController;
use App\Http\Controllers\Student;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json('hlooo');
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// user
Route::post('/login', [UserController::class, 'login']);

// Get current authenticated user
Route::get('/user', [UserController::class, 'getCurrentUser'])->middleware('auth:sanctum');

// Notifications
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [UserController::class, 'getNotifications']);
    Route::post('/notifications/{id}/read', [UserController::class, 'markNotificationRead']);
    Route::post('/notifications/read-all', [UserController::class, 'markAllNotificationsRead']);
});

// student

Route::post('/student-login', [Student::class, 'login']);

Route::post('/student-reg', [Student::class, 'store']);

Route::get('/get-students', [Student::class, 'index'])->middleware(['auth:sanctum']);

Route::get('/get-student/{student_id}', [Student::class, 'get_student']);

Route::get('/get-student-exam', [Student::class, 'exam']);
Route::get('/get-student-exam/{student_id}', [Student::class, 'get_student_exam']);

Route::post('/student-add-course/{student_id}', [Student::class, 'add_course']);

Route::post('/get-question/{question_id?}', [Student::class, 'get_question']);

Route::post('/answer-question/{student_id}/{question_id}/{course_id}', [Student::class, 'answer_question']);

Route::get('/submit-exam/{student_id}/{course_id}', [Student::class, 'submit_exam']);

// Adding POST route for submit-exam to match frontend expectations
Route::post('/submit-exam', function (Request $request) {
    $studentId = $request->input('student_id');
    $courseId = $request->input('course_id');

    if (! $studentId || ! $courseId) {
        return response()->json(['error' => 'Missing student_id or course_id'], 400);
    }

    return app()->call('App\Http\Controllers\Student@submit_exam', [
        'student_id' => $studentId,
        'course_id' => $courseId,
    ]);
});

Route::get('/student-courses/{student_id}', [Student::class, 'get_courses']);

Route::post('/check-student/{student_id}', [Student::class, 'check_student']);

Route::post('/start-exam/{student_id}', [Student::class, 'start_exam']);

// instructor
Route::get('/get-users', [Instructor::class, 'index'])->middleware(['auth:sanctum']);

Route::post('/add-user', [Instructor::class, 'store'])->middleware(['auth:sanctum']);

Route::match(['put', 'patch'], '/update-user/{id}', [Instructor::class, 'update']);
Route::post('/reset-user-password/{id}', [Instructor::class, 'resetUserPassword']);

// Protected instructor and lecturer routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/get-lecturer-courses/{user_id}', [Instructor::class, 'get_courses']);
    Route::get('/get-user/{id}', [Instructor::class, 'show']);
    Route::post('/add-exam/{user_id}/{course_id}', [Instructor::class, 'add_exam']);
    Route::put('/update-exam/{exam_id}', [Instructor::class, 'update_exam']);
    Route::get('/get-exams/{user_id}/{course_id}', [Instructor::class, 'get_exams']);
    Route::post('/submit-exam/{exam_id}', [Instructor::class, 'submitExam']);
    Route::post('/recall-exam/{exam_id}', [Instructor::class, 'recallExam']);
    Route::get('/get-exam-by-id/{exam_id}', [Instructor::class, 'get_exam_by_id']);
    Route::get('/delete-exam/{exam_id}', [Instructor::class, 'delete_exam']);
    Route::post('/add-question/{question_id}/{user_id}/{course_id}/{exam_id}', [Instructor::class, 'add_question']);
    Route::get('/get-questions/{exam_id}', [Instructor::class, 'get_questions']);
    Route::get('/get-question/{question_id}', [Instructor::class, 'get_question']);
    Route::get('/get-exam', [Instructor::class, 'get_exam']);
    Route::get('/get-students/{user_id}/{course_id}', [Instructor::class, 'get_students']);
    Route::get('/get-students-score/{course_id}', [Instructor::class, 'get_student_scores_for_course']);
    Route::get('/get-archive-by-exam/{exam_id}', [Instructor::class, 'get_archive_by_exam']);
});

// Export student scores
Route::get('/export-student-scores/{course_id}', [Instructor::class, 'export_student_scores']);

// Get student scores for course (enhanced data for display)
Route::get('/student-scores-for-course/{course_id}', [Instructor::class, 'get_student_scores_for_course']);

Route::post('/student-submit-exam/{course_id}/{candidate_id}', [Instructor::class, 'student_submit_exam']);

Route::patch('/edit-question/{question_id}', [Instructor::class, 'edit_question']);

// admin

Route::post('/add-acd-session', [Admin::class, 'add_acd_session']);

Route::get('/get-acd-sessions', [Admin::class, 'get_acd_sessions']);

Route::get('/get-acd-session/{session_Id}', [Admin::class, 'get_acd_session']);

Route::post('/activate-acd-session/{session_Id}', [Admin::class, 'activate_session']);
Route::post('/deactivate-acd-session/{session_Id}', [Admin::class, 'deactivate_session']);

Route::get('/get-active-session', [Admin::class, 'get_active_session']);

// Semester and Course Management - Requires Authentication
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/add-semester/{session_id}', [Admin::class, 'add_semester']);
    Route::get('/get-semester/{semester_id}', [Admin::class, 'get_semester']);
    Route::post('/add-course/{semester_id}', [Admin::class, 'add_course']);
    Route::get('/get-semester-courses/{id}', [Admin::class, 'get_semester_courses']);
    Route::post('/activate-semester/{semester_id}', [Admin::class, 'activate_semester']);
    Route::get('/get-all-courses', [Admin::class, 'get_courses']);
    Route::get('/get-courses', [Admin::class, 'get_courses']);
    Route::post('/add-lecturer-course/{user_id}/{course_id}', [Admin::class, 'add_lecturer_course']);
});

Route::get('/get-course/{course_id}', [Admin::class, 'get_course']);

// Route::post('/add-lecturer-course/{user_id}', [Admin::class, 'add_lecturer_course']);

// Debug route for exam visibility
Route::get('/debug-exam-visibility', function (Request $request) {
    $user = $request->user();

    $allExams = \App\Models\Exam::with(['course.semester.acdSession', 'user'])->get();

    $mappedExams = $allExams->map(function ($exam) {
        return [
            'id' => $exam->id,
            'title' => $exam->title ?? 'N/A',
            'status' => $exam->status,
            'submission_status' => $exam->submission_status,
            'activated' => $exam->activated,
            'finished_time' => $exam->finished_time,
            'course' => $exam->course ? $exam->course->title : 'No Course',
            'course_id' => $exam->course_id,
            'department' => $exam->course && $exam->course->semester && $exam->course->semester->acdSession
                ? $exam->course->semester->acdSession->title
                : 'N/A',
            'department_id' => $exam->course && $exam->course->semester
                ? $exam->course->semester->acd_session_id
                : 'N/A',
            'faculty_id' => $exam->course && $exam->course->semester && $exam->course->semester->acdSession
                ? $exam->course->semester->acdSession->faculty_id
                : 'NULL',
        ];
    });

    return response()->json([
        'user' => [
            'id' => $user->id,
            'role' => $user->role,
            'faculty_id' => $user->faculty_id,
            'level_id' => $user->level_id,
        ],
        'all_exams' => $mappedExams,
    ]);
})->middleware('auth:sanctum');

Route::get('/get-exams', [Admin::class, 'get_exams'])->middleware(['auth:sanctum']);

Route::get('/exam-tickets/{exam_id}', [Admin::class, 'get_exam_tickets'])->middleware(['auth:sanctum']);

Route::post('/activate-exam/{exam_id}', [Admin::class, 'activate_exam'])->middleware(['auth:sanctum']);

Route::post('/terminate-exam/{exam_id}', [Admin::class, 'terminate_exam'])->middleware(['auth:sanctum']);

Route::post('/request-terminate-exam/{exam_id}', [Admin::class, 'request_terminate_exam'])->middleware(['auth:sanctum']);
Route::post('/approve-termination-request/{request_id}', [Admin::class, 'approve_termination_request'])->middleware(['auth:sanctum']);
Route::post('/reject-termination-request/{request_id}', [Admin::class, 'reject_termination_request'])->middleware(['auth:sanctum']);
Route::get('/pending-termination-requests', [Admin::class, 'get_pending_termination_requests'])->middleware(['auth:sanctum']);

Route::post('/register-student/{user_id}', [Admin::class, 'register_student'])->middleware(['auth:sanctum']);
Route::post('/update-student/{student_id}', [Admin::class, 'update_student'])->middleware(['auth:sanctum']);

Route::get('/get-course-students/{course_id}', [Admin::class, 'get_course_students']);

Route::post('/upload-excel', [Admin::class, 'upload_excel']);

Route::post('/upload-instructors-excel', [Admin::class, 'upload_instructors_excel'])->middleware(['auth:sanctum']);

Route::put('/update-instructor-status/{id}', [Admin::class, 'update_instructor_status'])->middleware(['auth:sanctum']);

Route::get('/dashboard-stats', [Admin::class, 'getDashboardStats']);
Route::get('/recent-activities', [Admin::class, 'getRecentActivities'])->middleware(['auth:sanctum']);

Route::get('/get-invigilators', [Admin::class, 'get_invigilators'])->middleware(['auth:sanctum']);

Route::get('/get-invigilator/{invigilator_id}', [Admin::class, 'get_invigilator']);

// Question Bank routes
Route::get('/question-bank/{user_id}/{course_Id}', [Instructor::class, 'getQuestionBank']);
Route::get('/question-bank/{user_id}/{exam_id}', [Instructor::class, 'getExamQuestionBank']);

// TODO: populate student answer table with question that the student answer

Route::get('/get-current-exam', [Admin::class, 'get_current_exam'])->middleware(['auth:sanctum']);

Route::get('/exam-archives', [Admin::class, 'getExamArchives'])->middleware(['auth:sanctum']);
Route::get('/exam-archives/{archive_id}', [Admin::class, 'getExamArchive'])->middleware(['auth:sanctum']);

// Dashboard routes
Route::get('/upcoming-exams', [Admin::class, 'getUpcomingExams']);
Route::get('/recent-submissions', [Admin::class, 'getRecentSubmissions']);
Route::get('/exam-submissions', [Admin::class, 'getExamSubmissions'])->middleware(['auth:sanctum']);

// Admin user management
Route::post('/create-admin-user', [Admin::class, 'createAdminUser'])->middleware(['auth:sanctum']);
Route::post('/create-super-admin', [Admin::class, 'createSuperAdmin'])->middleware(['auth:sanctum']);
Route::post('/create-level-admin', [Admin::class, 'createLevelAdmin'])->middleware(['auth:sanctum']);
Route::get('/get-admins', [Admin::class, 'getAdmins'])->middleware(['auth:sanctum']);
Route::put('/update-admin/{adminId}', [Admin::class, 'updateAdmin'])->middleware(['auth:sanctum']);
Route::delete('/delete-admin/{adminId}', [Admin::class, 'deleteAdmin'])->middleware(['auth:sanctum']);
Route::post('/reset-admin-password/{adminId}', [Admin::class, 'resetAdminPassword'])->middleware(['auth:sanctum']);
Route::post('/import-admins', [Admin::class, 'importAdmins'])->middleware(['auth:sanctum']);
Route::get('/download-sample-admins-import', [Admin::class, 'downloadSampleImportFile'])->middleware(['auth:sanctum']);

// Level-based filtering routes
Route::get('/students-by-level', [Admin::class, 'getStudentsByLevel'])->middleware(['auth:sanctum']);
Route::get('/exams-by-level', [Admin::class, 'getExamsByLevel'])->middleware(['auth:sanctum']);
Route::get('/users-by-level', [Admin::class, 'getUsersByLevel'])->middleware(['auth:sanctum']);
Route::post('/reset-student-login/{studentId}', [Admin::class, 'resetStudentLogin'])->middleware(['auth:sanctum']);

// Department management routes (Super Admin only)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/departments', [\App\Http\Controllers\DepartmentController::class, 'index']);
    Route::get('/departments/{id}', [\App\Http\Controllers\DepartmentController::class, 'show']);
    Route::post('/departments', [\App\Http\Controllers\DepartmentController::class, 'store']);
    Route::put('/departments/{id}', [\App\Http\Controllers\DepartmentController::class, 'update']);
    Route::delete('/departments/{id}', [\App\Http\Controllers\DepartmentController::class, 'destroy']);
    Route::put('/departments/{id}/toggle-status', [\App\Http\Controllers\DepartmentController::class, 'toggleStatus']);
    Route::put('/departments/{id}/toggle-enrollment', [\App\Http\Controllers\DepartmentController::class, 'toggleEnrollment']);

    // Legacy department routes (for backward compatibility)
    Route::get('/departments-legacy', [\App\Http\Controllers\DepartmentController::class, 'getDepartments']);
    Route::get('/departments/{id}/dashboard', [\App\Http\Controllers\DepartmentController::class, 'getDepartmentDashboard']);
});

// Invigilator routes
Route::post('/invigilator/checkin-student', [InvigilatorController::class, 'checkin_student'])->middleware(['auth:sanctum']);
Route::post('/invigilator/generate-ticket', [InvigilatorController::class, 'generate_ticket']);
Route::post('/invigilator/regenerate-ticket', [InvigilatorController::class, 'regenerate_ticket']);
Route::get('/invigilator/students/{course_id}', [InvigilatorController::class, 'get_students'])->middleware(['auth:sanctum']);
Route::post('/extend-time', [InvigilatorController::class, 'extend_time']);
Route::post('/invigilator/start-exam/{course_id}', [InvigilatorController::class, 'start_exam'])->middleware(['auth:sanctum']);
Route::post('/invigilator/terminate-exam/{course_id}', [InvigilatorController::class, 'terminate_exam'])->middleware(['auth:sanctum']);

// Student Enrollment routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/enroll-students', [Admin::class, 'enrollStudents']);
    Route::post('/unenroll-student', [Admin::class, 'unenrollStudent']);
    Route::get('/unenrolled-students/{course_id}', [Admin::class, 'getUnenrolledStudents']);
    Route::post('/enroll-students-by-level', [Admin::class, 'enrollStudentsByLevel']);
});

// Global Session Management (Super Admin)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/set-global-session/{sessionId}', [Admin::class, 'setGlobalActiveSession']);
    Route::get('/get-global-session', [Admin::class, 'getGlobalActiveSession']);
    Route::get('/get-active-session-courses', [Admin::class, 'getActiveSessionCourses']);
    Route::post('/add-course-to-session', [Admin::class, 'addCourseToActiveSession']);
    Route::post('/assign-course-to-lecturer', [Admin::class, 'assignCourseToLecturer']);
    Route::get('/get-semesters/{session_id}', [Admin::class, 'getSessionSemesters']);
    Route::post('/import-courses', [Admin::class, 'importCourses']);
    Route::get('/download-sample-course-import', [Admin::class, 'downloadSampleCourseImport']);

    // Faculty management
    Route::apiResource('faculties', \App\Http\Controllers\FacultyController::class);
    Route::get('faculties/{id}/officers', [\App\Http\Controllers\FacultyController::class, 'getFacultyOfficers']);

    Route::post('/import-faculties', [\App\Http\Controllers\FacultyController::class, 'importFaculties']);
    Route::get('/download-sample-faculties-import', [\App\Http\Controllers\FacultyController::class, 'downloadSampleImportFile']);
    Route::post('/create-faculty-officer', [Admin::class, 'createFacultyOfficer']);

    // System Settings (Super Admin)
    Route::get('/system-settings', [Admin::class, 'get_system_settings']);
    Route::post('/system-settings', [Admin::class, 'update_system_setting']);
    Route::post('/change-password', [Admin::class, 'changePassword']);

    // Exam Security & Violation Logging
    Route::get('/exam/{examId}/violations', [Admin::class, 'getExamViolations']);
    Route::get('/student/{studentId}/violations', [Admin::class, 'getStudentViolations']);
    Route::put('/exam/{examId}/security-settings', [Admin::class, 'updateExamSecuritySettings']);
    Route::get('/exam/{examId}/security-settings', [Admin::class, 'getExamSecuritySettings']);
});

// Student Exam Security & Violation Logging (No Auth Required)
Route::post('/log-violation', [Admin::class, 'logViolation']);
Route::get('/debug-semesters/{sessionId}', function ($sessionId) {
    $user = request()->user();
    $semesters = App\Models\Semester::where('acd_session_id', $sessionId)->get();

    return response()->json([
        'user' => $user ? ['id' => $user->id, 'role' => $user->role] : null,
        'sessionId' => $sessionId,
        'allSemesters' => $semesters,
        'userSemesters' => $user ? App\Models\Semester::where('acd_session_id', $sessionId)->where('created_by', $user->id)->get() : [],
    ]);
})->middleware('auth:sanctum');

// Additional debug route to check what get-semesters returns
Route::get('/debug-get-semesters/{sessionId}', function ($sessionId) {
    $user = auth('sanctum')->user();

    if (! $user) {
        return response()->json(['error' => 'Not authenticated'], 401);
    }

    $query = App\Models\Semester::where('acd_session_id', $sessionId);

    // Apply role-based filtering
    if ($user->role === 'level_admin') {
        $query->where('created_by', $user->id);
    }

    $semesters = $query->get();

    return response()->json([
        'debug_info' => [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'session_id' => $sessionId,
            'query_applied' => $user->role === 'level_admin' ? 'Filtered by created_by' : 'No filtering',
        ],
        'semesters' => $semesters,
        'count' => $semesters->count(),
    ]);
})->middleware('auth:sanctum');

// Debug route for testing lecturer courses without auth
Route::get('/debug-lecturer-courses/{user_id}', function ($user_id) {
    $courses = App\Models\LecturerCourse::where('user_id', $user_id)->get();

    return response()->json([
        'user_id' => $user_id,
        'courses_count' => $courses->count(),
        'courses' => $courses,
    ]);
});

// Debug route for level admin exam filtering
Route::get('/debug-exam-filtering', function () {
    $user = auth('sanctum')->user();

    if (! $user) {
        return response()->json(['error' => 'Not authenticated'], 401);
    }

    // Get all submitted exams
    $allExams = App\Models\Exam::where('submission_status', 'submitted')->get();

    // Get courses assigned by this level admin
    $assignedCourses = App\Models\LecturerCourse::where('created_by', $user->id)->get();
    $assignedCourseIds = $assignedCourses->pluck('course_id')->toArray();

    // Get filtered exams
    $filteredExams = App\Models\Exam::where('submission_status', 'submitted')
        ->whereIn('course_id', $assignedCourseIds)
        ->get();

    return response()->json([
        'user' => [
            'id' => $user->id,
            'role' => $user->role,
            'name' => $user->full_name,
        ],
        'all_submitted_exams_count' => $allExams->count(),
        'assigned_courses' => $assignedCourses,
        'assigned_course_ids' => $assignedCourseIds,
        'filtered_exams_count' => $filteredExams->count(),
        'filtered_exams' => $filteredExams,
        'all_exams' => $allExams,
    ]);
})->middleware('auth:sanctum');
