<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\Student;
use App\Models\Course;
use App\Models\StudentCourse;

// Load Laravel environment
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Enroll Students in Courses ===\n\n";

try {
    // Get all students
    $students = Student::all();
    
    if ($students->isEmpty()) {
        echo "No students found. Please create students first.\n";
        exit(1);
    }
    
    // Get all courses
    $courses = Course::all();
    
    if ($courses->isEmpty()) {
        echo "No courses found. Please create courses first.\n";
        exit(1);
    }
    
    echo "Found {$students->count()} student(s) and {$courses->count()} course(s)\n\n";
    
    $enrolled = 0;
    $skipped = 0;
    
    // Enroll each student in all available courses
    foreach ($students as $student) {
        echo "Student: {$student->full_name} ({$student->candidate_no})\n";
        
        foreach ($courses as $course) {
            // Check if already enrolled
            $existing = StudentCourse::where('student_id', $student->id)
                ->where('course_id', $course->id)
                ->first();
            
            if ($existing) {
                echo "  - Already enrolled in: {$course->title}\n";
                $skipped++;
                continue;
            }
            
            // Enroll student in course
            StudentCourse::create([
                'student_id' => $student->id,
                'course_id' => $course->id,
                'status' => 'active'
            ]);
            
            echo "  ✓ Enrolled in: {$course->title}\n";
            $enrolled++;
        }
        
        echo "\n";
    }
    
    echo "====================================\n";
    echo "✅ Enrollment complete!\n";
    echo "New enrollments: {$enrolled}\n";
    echo "Already enrolled: {$skipped}\n";
    echo "\nStudents can now take exams for their enrolled courses.\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
