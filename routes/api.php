<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Instructor;
use App\Http\Controllers\Student;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// user
Route::post('/login', [UserController::class, 'login']);


// student

Route::post('/student-login', [Student::class, 'login']);

Route::post('/student-reg', [Student::class, 'store']);

Route::get('/get-students', [Student::class, 'index']);

Route::get('/get-student/{student_id}', [Student::class, 'get_student']);

Route::get('/get-student-exam', [Student::class, 'exam']);

Route::post('/student-add-course/{student_id}', [Student::class, 'add_course']);

Route::post('/get-question/{question_id?}', [Student::class, 'get_question']);

Route::post('/answer-question/{student_id}/{question_id}/{course_id}',[Student::class, 'answer_question']);

Route::get('/submit-exam/{student_id}/{course_id}', [Student::class,'submit_exam']);

Route::get('/student-courses/{student_id}', [Student::class, 'get_courses']);

Route::post('/check-student/{student_id}', [Student::class, 'check_student']);

Route::post('/start-exam/{student_id}', [Student::class, 'start_exam']);



// instructor
Route::get('/get-users', [Instructor::class, 'index']);

Route::post('/add-user', [Instructor::class, 'store']);

Route::get('/get-user/{id}', [Instructor::class, 'show']);

Route::patch('/update-user/{id}',[Instructor::class, 'update']);

Route::post('/add-exam/{user_id}/{course_id}',[Instructor::class, 'add_exam']);

Route::get('/get-exams/{user_id}/{course_id}',[Instructor::class, 'get_exams']);

Route::get('/get-courses/{user_id}',[Instructor::class, 'get_courses']);

Route::post('/submit-exam/{exam_id}',[Instructor::class, 'submitExam']);

// Route::get('/get-exam/{exam_id}',[Instructor::class, 'get_exam']);
Route::get('/get-exam',[Instructor::class, 'get_exam']);

Route::get('/get-exam-by-id/{exam_id}',[Instructor::class, 'get_exam_by_id']);

Route::get('/delete-exam/{exam_id}',[Instructor::class, 'delete_exam']);

Route::post('/add-question/{question_id}/{user_id}/{course_id}/{exam_id}',[Instructor::class, 'add_question']);

Route::get('/get-questions/{exam_id}', [Instructor::class, 'get_questions']);

Route::get('/get-question/{question_id}', [Instructor::class, 'get_question']);

Route::get('/get-lecturer-courses/{user_id}', [Instructor::class, 'get_courses']);

// Route::get('/get-students-score/{course_id}', [Instructor::class, 'get_students_score']);


// ! I add the course_id so that I can easily search the db with the course Id
Route::get('/get-students/{user_id}/{course_id}', [Instructor::class, 'get_students']);

Route::get('/get-students-score/{course_id}', [Instructor::class, 'get_students_score']);

Route::post('/student-submit-exam/{course_id}/{candidate_id}', [Instructor::class, 'student_submit_exam']);

Route::patch('/edit-question/{question_id}', [Instructor::class, 'edit_question']);

// admin

Route::post('/add-acd-session', [Admin::class, 'add_acd_session']);

Route::get('/get-acd-sessions', [Admin::class, 'get_acd_sessions']);

Route::get('/get-acd-session/{session_Id}', [Admin::class, 'get_acd_session']);

Route::post('/activate-acd-session/{session_Id}', [Admin::class, 'activate_session']);

Route::get('/get-active-session', [Admin::class, 'get_active_session']);

Route::get('/get-semesters/{acd_sesssion_id}', [Admin::class, 'get_semesters']);

Route::post('/add-semester/{session_id}', [Admin::class, 'add_semester']);

Route::get('/get-semester/{semester_id}', [Admin::class, 'get_semester']);

Route::post('/add-course/{semester_id}', [Admin::class, 'add_course']);

Route::get('/get-semester-courses/{id}', [Admin::class, 'get_semester_courses']);

Route::post('/activate-semester/{semester_id}', [Admin::class, 'activate_semester']);

Route::get('/get-all-courses', [Admin::class, 'get_courses']);

Route::get('/get-course-exam-questions/{course_id}', [Admin::class, 'get_course']);

Route::get('/get-courses', [Admin::class, 'get_courses']);

Route::get('/get-course/{course_id}', [Admin::class, 'get_course']);
// Route::post('/add-lecturer-course/{user_id}', [Admin::class, 'add_lecturer_course']);

Route::post('/add-lecturer-course/{user_id}/{course_id}', [Admin::class, 'add_lecturer_course']);

Route::get('/get-exams', [Admin::class,'get_exams']);

Route::post('/activate-exam/{exam_id}', [Admin::class,'activate_exam']);

Route::post('/terminate-exam/{exam_id}', [Admin::class,'terminate_exam']);

Route::post('/register-student/{user_id}', [Admin::class, 'register_student']);

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




