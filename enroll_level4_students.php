<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Student;
use App\Models\Course;
use App\Models\StudentCourse;

echo "=== Enrolling Level 4 Students in Course 3 ===\n\n";

// Get Course 3
$course = Course::find(3);
if (!$course) {
    echo "Error: Course 3 not found!\n";
    exit(1);
}

echo "Course ID: {$course->id}\n";
echo "Course Name: {$course->name}\n";
echo "Course Code: {$course->course_code}\n\n";

// Get all students with level_id = 4
$students = Student::where('level_id', 4)->get();

echo "Found " . $students->count() . " students with level_id = 4\n\n";

foreach ($students as $student) {
    // Check if already enrolled
    $existing = StudentCourse::where('student_id', $student->id)
        ->where('course_id', $course->id)
        ->first();
    
    if ($existing) {
        echo "✓ Student '{$student->full_name}' (ID: {$student->id}) already enrolled\n";
    } else {
        // Enroll the student
        StudentCourse::create([
            'student_id' => $student->id,
            'course_id' => $course->id
        ]);
        echo "✓ Enrolled student '{$student->full_name}' (ID: {$student->id}) in course\n";
    }
}

echo "\n=== Enrollment Complete ===\n";
echo "Course 3 now has " . $course->studentCourses()->count() . " enrolled students\n";
