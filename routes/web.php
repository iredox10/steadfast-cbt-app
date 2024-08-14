<?php

use App\Http\Controllers\Controller;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::post('/add-user', [UserController::class, 'addUser']);
Route::get('/add-user', function () {
    return view('user.add_user');
});

Route::get('/get-users', [UserController::class, 'getUsers']);
Route::get('/get-user/{id}', [UserController::class, 'getUser']);
Route::post('/login', [UserController::class, 'login']);
Route::get('/test', function () {
    return view('test');
});

Route::get('/admin', function () {
    return view('admin.admin');
});
Route::get('/users', function () {
    return view('users', ['hello' => 'this is hello from route']);
});


Route::get('/student', function(){
    return view('student');
});

Route::get('/instructor-dashboard', function(){
    return view('instructor.dashboard');
});