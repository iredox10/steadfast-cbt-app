<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Course;
use App\Models\Student;
use App\Models\Exam;

// Get all courses
$courses = Course::with('studentCourses')->get();

echo "=== Checking Courses, Exams, and Students ===\n\n";

foreach ($courses as $course) {
    echo "Course ID: {$course->id}, Name: {$course->name}\n";
    
    // Get active exam for this course
    $active_exam = Exam::where('course_id', $course->id)->where('activated', 'yes')->first();
    
    if ($active_exam) {
        echo "  Active Exam ID: {$active_exam->id}\n";
        echo "  Exam level_id: " . ($active_exam->level_id ?? 'NULL') . "\n";
    } else {
        echo "  No active exam\n";
    }
    
    // Get students
    $students = $course->studentCourses;
    echo "  Total enrolled students: " . $students->count() . "\n";
    
    if ($students->count() > 0) {
        echo "  Student level_ids:\n";
        foreach ($students as $student_course) {
            $student = Student::find($student_course->student_id);
            if ($student) {
                echo "    - Student ID: {$student->id}, Name: {$student->full_name}, level_id: " . ($student->level_id ?? 'NULL') . "\n";
            }
        }
    }
    
    echo "\n";
}
