<?php

use App\Http\Controllers\Admin;
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

// instructor
Route::get('/get-users', [Instructor::class, 'index']);

Route::post('/add-user', [Instructor::class, 'store']);

Route::get('/get-user/{id}', [Instructor::class, 'show']);

Route::patch('/update-user/{id}',[Instructor::class, 'update']);

Route::post('/add-exam/{user_id}/{course_id}',[Instructor::class, 'add_exam']);

Route::get('/get-exams/{user_id}',[Instructor::class, 'get_exams']);

Route::post('/add-question/{user_id}/{exam_id}',[Instructor::class, 'add_question']);

Route::get('/get-questions/{exam_id}', [Instructor::class, 'get_questions']);

Route::get('/get-question/{question_id}', [Instructor::class, 'get_question']);

Route::get('/get-lecturer-courses/{user_id}', [Instructor::class, 'get_courses']);

// admin

Route::post('/add-acd-session', [Admin::class, 'add_acd_session']);

Route::get('/get-semesters/{acd_sesssion_id}', [Admin::class, 'get_semesters']);

Route::post('/add-semester/{session_id}', [Admin::class, 'add_semester']);

Route::post('/add-course/{semester_id}', [Admin::class, 'add_course']);

Route::get('/get-courses/{semester_id}', [Admin::class, 'get_courses']);

Route::get('/get-course/{course_id}', [Admin::class, 'get_course']);

Route::post('/add-lecturer-course/{user_id}/{course_id}', [Admin::class, 'add_lecturer_course']);



