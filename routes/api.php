<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Instructor;
use App\Http\Controllers\InvigilatorController;
use App\Http\Controllers\Student;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function(){
            return response()->json('hlooo');
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// user
Route::post('/login', [UserController::class, 'login']);

// Get current authenticated user
Route::get('/user', [UserController::class, 'getCurrentUser'])->middleware('auth:sanctum');


// student

Route::post('/student-login', [Student::class, 'login']);

Route::post('/student-reg', [Student::class, 'store']);

Route::get('/get-students', [Student::class, 'index'])->middleware(['auth:sanctum']);

Route::get('/get-student/{student_id}', [Student::class, 'get_student']);

Route::get('/get-student-exam', [Student::class, 'exam']);
Route::get('/get-student-exam/{student_id}', [Student::class, 'get_student_exam']);

Route::post('/student-add-course/{student_id}', [Student::class, 'add_course']);

Route::post('/get-question/{question_id?}', [Student::class, 'get_question']);

Route::post('/answer-question/{student_id}/{question_id}/{course_id}',[Student::class, 'answer_question']);

Route::get('/submit-exam/{student_id}/{course_id}', [Student::class,'submit_exam']);

// Adding POST route for submit-exam to match frontend expectations
Route::post('/submit-exam', function (Request $request) {
    $studentId = $request->input('student_id');
    $courseId = $request->input('course_id');

    if (!$studentId || !$courseId) {
        return response()->json(['error' => 'Missing student_id or course_id'], 400);
    }

    return app()->call('App\Http\Controllers\Student@submit_exam', [
        'student_id' => $studentId,
        'course_id' => $courseId
    ]);
});

Route::get('/student-courses/{student_id}', [Student::class, 'get_courses']);

Route::post('/check-student/{student_id}', [Student::class, 'check_student']);

Route::post('/start-exam/{student_id}', [Student::class, 'start_exam']);


// instructor
Route::get('/get-users', [Instructor::class, 'index'])->middleware(['auth:sanctum']);

Route::post('/add-user', [Instructor::class, 'store'])->middleware(['auth:sanctum']);

Route::patch('/update-user/{id}',[Instructor::class, 'update']);

// Protected instructor and lecturer routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/get-lecturer-courses/{user_id}', [Instructor::class, 'get_courses']);
    Route::get('/get-user/{id}', [Instructor::class, 'show']);
    Route::post('/add-exam/{user_id}/{course_id}', [Instructor::class, 'add_exam']);
    Route::get('/get-exams/{user_id}/{course_id}', [Instructor::class, 'get_exams']);
    Route::post('/submit-exam/{exam_id}', [Instructor::class, 'submitExam']);
    Route::get('/get-exam-by-id/{exam_id}', [Instructor::class, 'get_exam_by_id']);
    Route::get('/delete-exam/{exam_id}', [Instructor::class, 'delete_exam']);
    Route::post('/add-question/{question_id}/{user_id}/{course_id}/{exam_id}', [Instructor::class, 'add_question']);
    Route::get('/get-questions/{exam_id}', [Instructor::class, 'get_questions']);
    Route::get('/get-question/{question_id}', [Instructor::class, 'get_question']);
    Route::get('/get-exam', [Instructor::class, 'get_exam']);
    Route::get('/get-students/{user_id}/{course_id}', [Instructor::class, 'get_students']);
    Route::get('/get-students-score/{course_id}', [Instructor::class, 'get_student_scores_for_course']);
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
    Route::get('/get-course/{course_id}', [Admin::class, 'get_course']);
    Route::post('/add-lecturer-course/{user_id}/{course_id}', [Admin::class, 'add_lecturer_course']);
});

// Route::post('/add-lecturer-course/{user_id}', [Admin::class, 'add_lecturer_course']);

Route::get('/get-exams', [Admin::class,'get_exams']);

Route::post('/activate-exam/{exam_id}', [Admin::class,'activate_exam']);

Route::post('/terminate-exam/{exam_id}', [Admin::class,'terminate_exam']);

Route::post('/register-student/{user_id}', [Admin::class, 'register_student'])->middleware(['auth:sanctum']);

Route::get('/get-course-students/{course_id}', [Admin::class, 'get_course_students']);

Route::post('/upload-excel', [Admin::class, 'upload_excel']);

Route::get('/dashboard-stats', [Admin::class, 'getDashboardStats']);

Route::get('/get-invigilators', [Admin::class, 'get_invigilators']);

Route::get('/get-invigilator/{invigilator_id}', [Admin::class, 'get_invigilator']);

// Question Bank routes
Route::get('/question-bank/{user_id}/{course_Id}', [Instructor::class, 'getQuestionBank']);
Route::get('/question-bank/{user_id}/{exam_id}', [Instructor::class, 'getExamQuestionBank']);

// TODO: populate student answer table with question that the student answer

Route::get('/get-current-exam', [Admin::class, 'get_current_exam']);

Route::get('/exam-archives', [Admin::class, 'getExamArchives']);
Route::get('/exam-archives/{archive_id}', [Admin::class, 'getExamArchive']);

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

// Level-based filtering routes
Route::get('/students-by-level', [Admin::class, 'getStudentsByLevel'])->middleware(['auth:sanctum']);
Route::get('/exams-by-level', [Admin::class, 'getExamsByLevel'])->middleware(['auth:sanctum']);
Route::get('/users-by-level', [Admin::class, 'getUsersByLevel'])->middleware(['auth:sanctum']);

// Department management routes (Super Admin only)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/departments', [\App\Http\Controllers\DepartmentController::class, 'index']);
    Route::get('/departments/{id}', [\App\Http\Controllers\DepartmentController::class, 'show']);
    Route::post('/departments', [\App\Http\Controllers\DepartmentController::class, 'store']);
    Route::put('/departments/{id}', [\App\Http\Controllers\DepartmentController::class, 'update']);
    Route::delete('/departments/{id}', [\App\Http\Controllers\DepartmentController::class, 'destroy']);
    Route::put('/departments/{id}/toggle-status', [\App\Http\Controllers\DepartmentController::class, 'toggleStatus']);

    // Legacy department routes (for backward compatibility)
    Route::get('/departments-legacy', [\App\Http\Controllers\DepartmentController::class, 'getDepartments']);
    Route::get('/departments/{id}/dashboard', [\App\Http\Controllers\DepartmentController::class, 'getDepartmentDashboard']);
});

// Invigilator routes
Route::post('/invigilator/generate-ticket', [InvigilatorController::class, 'generate_ticket']);
Route::post('/invigilator/regenerate-ticket', [InvigilatorController::class, 'regenerate_ticket']);
Route::get('/invigilator/students/{course_id}', [InvigilatorController::class, 'get_students'])->middleware(['auth:sanctum']);
Route::post('/extend-time', [InvigilatorController::class, 'extend_time']);
Route::post('/terminate-exam/{course_id}', [InvigilatorController::class, 'terminate_exam']);

// Global Session Management (Super Admin)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/set-global-session', [Admin::class, 'setGlobalActiveSession']);
    Route::get('/get-global-session', [Admin::class, 'getGlobalActiveSession']);
    Route::get('/get-active-session-courses', [Admin::class, 'getActiveSessionCourses']);
    Route::post('/add-course-to-session', [Admin::class, 'addCourseToActiveSession']);
    Route::post('/assign-course-to-lecturer', [Admin::class, 'assignCourseToLecturer']);
    Route::get('/get-semesters/{session_id}', [Admin::class, 'getSessionSemesters']);
});
Route::get('/debug-semesters/{sessionId}', function($sessionId) { 
    $user = request()->user(); 
    $semesters = App\Models\Semester::where('acd_session_id', $sessionId)->get(); 
    return response()->json([
        'user' => $user ? ['id' => $user->id, 'role' => $user->role] : null,
        'sessionId' => $sessionId,
        'allSemesters' => $semesters,
        'userSemesters' => $user ? App\Models\Semester::where('acd_session_id', $sessionId)->where('created_by', $user->id)->get() : []
    ]);
})->middleware('auth:sanctum');

// Additional debug route to check what get-semesters returns
Route::get('/debug-get-semesters/{sessionId}', function($sessionId) {
    $user = auth('sanctum')->user();
    
    if (!$user) {
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
        'count' => $semesters->count()
    ]);
})->middleware('auth:sanctum');

// Debug route for testing lecturer courses without auth
Route::get('/debug-lecturer-courses/{user_id}', function($user_id) {
    $courses = App\Models\LecturerCourse::where('user_id', $user_id)->get();
    return response()->json([
        'user_id' => $user_id,
        'courses_count' => $courses->count(),
        'courses' => $courses
    ]);
});
