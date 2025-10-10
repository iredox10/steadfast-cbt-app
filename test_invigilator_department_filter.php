<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Course;
use App\Models\Student;
use App\Models\Exam;
use App\Models\User;

echo "=== Testing Department-Based Student Filtering for Invigilators ===\n\n";

// Get all invigilators
$invigilators = User::where('role', 'invigilator')->get();

echo "Total Invigilators: " . $invigilators->count() . "\n\n";

foreach ($invigilators as $invigilator) {
    echo "Invigilator: {$invigilator->full_name} (ID: {$invigilator->id})\n";
    echo "  Email: {$invigilator->email}\n";
    echo "  Level ID (Department): " . ($invigilator->level_id ?? 'NULL') . "\n";
    
    // Get the exam assigned to this invigilator
    $exam = Exam::where('activated', 'yes')
        ->where(function($query) use ($invigilator) {
            $query->where('invigilator', $invigilator->id)
                  ->orWhere('invigilator', $invigilator->email)
                  ->orWhere('invigilator', $invigilator->full_name);
        })->first();
    
    if ($exam) {
        echo "  Assigned Active Exam ID: {$exam->id}\n";
        echo "  Exam Course ID: {$exam->course_id}\n";
        
        // Get the course
        $course = Course::find($exam->course_id);
        if ($course) {
            echo "  Course: {$course->name} ({$course->course_code})\n";
            
            // Get all students enrolled in this course
            $allStudents = $course->studentCourses;
            echo "  Total students enrolled in course: " . $allStudents->count() . "\n";
            
            // Filter students by invigilator's level_id (simulating the endpoint logic)
            $visibleStudents = [];
            foreach ($allStudents as $sc) {
                $student = Student::find($sc->student_id);
                if ($student) {
                    // Apply the same filter as in the endpoint
                    if ($invigilator->level_id && $student->level_id != $invigilator->level_id) {
                        continue; // Skip - not in same department
                    }
                    $visibleStudents[] = $student;
                }
            }
            
            echo "  Students VISIBLE to this invigilator: " . count($visibleStudents) . "\n";
            
            if (count($visibleStudents) > 0) {
                echo "  Visible Student Details:\n";
                foreach ($visibleStudents as $student) {
                    echo "    - {$student->full_name} (ID: {$student->id}, Level: {$student->level_id})\n";
                }
            }
            
            // Show filtered out students
            $filteredCount = $allStudents->count() - count($visibleStudents);
            if ($filteredCount > 0) {
                echo "  Students FILTERED OUT (different department): {$filteredCount}\n";
            }
        }
    } else {
        echo "  No active exam assigned\n";
    }
    
    echo "\n" . str_repeat("-", 80) . "\n\n";
}
