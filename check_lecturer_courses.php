<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Course;
use App\Models\LecturerCourse;

echo "=== Checking Lecturer Courses ===\n\n";

// Check lecturer_courses table
$lecturerCourses = LecturerCourse::all();
echo "Total Lecturer Courses: " . $lecturerCourses->count() . "\n";
foreach ($lecturerCourses as $lc) {
    $lecturer = User::find($lc->user_id);
    echo "  - Lecturer: {$lecturer->full_name} (ID: {$lc->user_id}), Course: {$lc->title} ({$lc->code})\n";
}
echo "\n";

// Check courses table
$courses = Course::all();
echo "Total Courses: " . $courses->count() . "\n";
foreach ($courses as $course) {
    echo "  - ID: {$course->id}, Title: {$course->title}, Code: {$course->code}, Created By: {$course->created_by}\n";
}
echo "\n";

// Check User model courses relationship
$lecturers = User::where('role', 'lecturer')->get();
echo "Lecturers and their courses:\n";
foreach ($lecturers as $lecturer) {
    echo "  - Lecturer: {$lecturer->full_name} (ID: {$lecturer->id})\n";
    $courses = $lecturer->courses;
    echo "    Courses count: " . $courses->count() . "\n";
    foreach ($courses as $course) {
        echo "      * {$course->title} ({$course->code})\n";
    }
}
