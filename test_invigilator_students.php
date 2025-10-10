<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Course;
use App\Models\Student;
use App\Models\Exam;
use App\Models\User;

echo "=== Debugging Invigilator Student Visibility ===\n\n";

// Get all invigilators
$invigilators = User::where('role', 'invigilator')->get();

echo "Total Invigilators: " . $invigilators->count() . "\n\n";

foreach ($invigilators as $invigilator) {
    echo "Invigilator: {$invigilator->full_name} (ID: {$invigilator->id})\n";
    echo "  Email: {$invigilator->email}\n";
    echo "  Level ID: " . ($invigilator->level_id ?? 'NULL') . "\n";
    echo "  Department ID: " . ($invigilator->department_id ?? 'NULL') . "\n";
    
    // Get the exam assigned to this invigilator (using the invigilator column)
    $exam = Exam::where('activated', 'yes')
        ->where(function($query) use ($invigilator) {
            $query->where('invigilator', $invigilator->id)
                  ->orWhere('invigilator', $invigilator->email)
                  ->orWhere('invigilator', $invigilator->full_name);
        })->first();
    
    if ($exam) {
        echo "  Assigned Active Exam ID: {$exam->id}\n";
        echo "  Exam Course ID: {$exam->course_id}\n";
        echo "  Exam Level ID: " . ($exam->level_id ?? 'NULL') . "\n";
        
        // Get the course
        $course = Course::find($exam->course_id);
        if ($course) {
            echo "  Course Name: {$course->name}\n";
            echo "  Course Code: {$course->course_code}\n";
            
            // Get students enrolled in this course
            $studentCourses = $course->studentCourses;
            echo "  Students enrolled in course: " . $studentCourses->count() . "\n";
            
            if ($studentCourses->count() > 0) {
                echo "  Student Details:\n";
                foreach ($studentCourses as $sc) {
                    $student = Student::find($sc->student_id);
                    if ($student) {
                        echo "    - Student ID: {$student->id}\n";
                        echo "      Name: {$student->full_name}\n";
                        echo "      Matric: {$student->matric_no}\n";
                        echo "      Level ID: " . ($student->level_id ?? 'NULL') . "\n";
                        echo "      Department ID: " . ($student->department_id ?? 'NULL') . "\n";
                        
                        // Check if match
                        $levelMatch = !$exam->level_id || ($student->level_id == $exam->level_id);
                        echo "      Level Match: " . ($levelMatch ? 'YES' : 'NO') . "\n";
                        echo "\n";
                    }
                }
            }
        }
    } else {
        echo "  No active exam assigned\n";
    }
    
    echo "\n" . str_repeat("-", 80) . "\n\n";
}

// Also check all active exams
echo "\n=== All Active Exams ===\n\n";
$activeExams = Exam::where('activated', 'yes')->get();
echo "Total Active Exams: " . $activeExams->count() . "\n\n";

foreach ($activeExams as $exam) {
    echo "Exam ID: {$exam->id}\n";
    echo "  Course ID: {$exam->course_id}\n";
    echo "  Invigilator ID: " . ($exam->invigilator_id ?? 'NULL') . "\n";
    echo "  Level ID: " . ($exam->level_id ?? 'NULL') . "\n";
    
    $course = Course::find($exam->course_id);
    if ($course) {
        echo "  Course: {$course->name} ({$course->course_code})\n";
        echo "  Enrolled Students: " . $course->studentCourses->count() . "\n";
    }
    echo "\n";
}
