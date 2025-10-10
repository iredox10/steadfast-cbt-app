<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Course;
use App\Models\Student;

echo "=== Testing Instructor Student Filtering ===\n\n";

// Test for each instructor
$instructors = User::where('role', 'lecturer')->get();

foreach ($instructors as $instructor) {
    echo "Instructor: {$instructor->full_name} (ID: {$instructor->id}, Level: {$instructor->level_id})\n";
    
    $courses = $instructor->courses;
    foreach ($courses as $lc) {
        $course = Course::find($lc->course_id);
        if (!$course) continue;
        
        echo "  Course: {$course->name} (ID: {$course->id})\n";
        
        // Get all students in course
        $allStudents = $course->studentCourses;
        echo "    Total students enrolled: " . $allStudents->count() . "\n";
        
        // Simulate the filtering logic
        $visibleStudents = [];
        foreach ($allStudents as $sc) {
            $student = Student::find($sc->student_id);
            if ($student) {
                // Apply instructor department filter
                if ($instructor->level_id && $student->level_id != $instructor->level_id) {
                    continue;
                }
                $visibleStudents[] = $student;
            }
        }
        
        echo "    Students VISIBLE to instructor: " . count($visibleStudents) . "\n";
        if (count($visibleStudents) > 0) {
            echo "    Visible students:\n";
            foreach ($visibleStudents as $student) {
                echo "      - {$student->full_name} (Level {$student->level_id})\n";
            }
        }
        
        $filteredCount = $allStudents->count() - count($visibleStudents);
        if ($filteredCount > 0) {
            echo "    Students FILTERED OUT (different department): {$filteredCount}\n";
        }
        echo "\n";
    }
    echo str_repeat("-", 80) . "\n\n";
}
