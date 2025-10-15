<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Exam;
use App\Models\Student;
use App\Models\StudentCourse;

echo "Checking ALL Mechanical Engineering Students\n";
echo "=============================================\n\n";

// Get active exam
$activeExam = Exam::where('activated', 'yes')->first();

if (!$activeExam) {
    echo "❌ No active exam found!\n";
    exit;
}

echo "Active Exam Level ID: {$activeExam->level_id} (Mechanical Engineering)\n";
echo "Active Exam Course ID: {$activeExam->course_id}\n\n";

// Get ALL students from Mechanical Engineering (Level 6)
$mechanicalStudents = Student::where('level_id', 6)->get();

echo "Total Mechanical Engineering Students in Database: {$mechanicalStudents->count()}\n";
echo str_repeat('-', 70) . "\n\n";

foreach ($mechanicalStudents as $student) {
    echo "Student: {$student->full_name} (ID: {$student->id})\n";
    echo "  Department: {$student->department}\n";
    echo "  Level ID: {$student->level_id}\n";
    
    // Check if enrolled in the course
    $enrollment = StudentCourse::where('student_id', $student->id)
        ->where('course_id', $activeExam->course_id)
        ->first();
    
    if ($enrollment) {
        echo "  ✓ ENROLLED in course {$activeExam->course_id}\n";
    } else {
        echo "  ✗ NOT ENROLLED in course {$activeExam->course_id}\n";
    }
    
    echo "\n";
}

echo "\n" . str_repeat('=', 70) . "\n";
echo "ISSUE IDENTIFIED:\n";
echo str_repeat('=', 70) . "\n";
echo "If you're seeing more Mechanical Engineering students showing 'Not generated',\n";
echo "it means they are NOT ENROLLED in the course for this exam.\n\n";
echo "To fix this:\n";
echo "1. Enroll the missing Mechanical Engineering students in course ID {$activeExam->course_id}\n";
echo "2. Or check if the students are actually from a different department\n";
