<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Course;
use App\Models\Student;
use App\Models\StudentCourse;

echo "=== Creating Test Scenario: Students from Different Departments ===\n\n";

// Let's enroll students from different departments into the same course to test filtering

// Get Course 4 (the one with active exam for invigilator at level 6)
$course = Course::find(4);
if (!$course) {
    echo "Course 4 not found. Creating it...\n";
    exit(1);
}

echo "Course ID: {$course->id}\n";
echo "Course Name: {$course->name}\n\n";

// Get all students
$allStudents = Student::all();
echo "All Students in System:\n";
foreach ($allStudents as $student) {
    echo "  - {$student->full_name} (ID: {$student->id}, Level: {$student->level_id})\n";
}
echo "\n";

// Enroll students from different levels into Course 4
echo "Enrolling students into Course 4:\n";
foreach ($allStudents as $student) {
    $existing = StudentCourse::where('student_id', $student->id)
        ->where('course_id', $course->id)
        ->first();
    
    if (!$existing) {
        StudentCourse::create([
            'student_id' => $student->id,
            'course_id' => $course->id
        ]);
        echo "  ✓ Enrolled {$student->full_name} (Level {$student->level_id})\n";
    } else {
        echo "  ✓ Already enrolled: {$student->full_name} (Level {$student->level_id})\n";
    }
}

echo "\n=== Result ===\n";
echo "Course 4 now has " . $course->studentCourses()->count() . " total enrolled students\n\n";

echo "When invigilator 'smith' (Level 6) accesses the invigilator page:\n";
echo "  - Will see: Students with level_id = 6\n";
echo "  - Will NOT see: Students with level_id ≠ 6\n";
