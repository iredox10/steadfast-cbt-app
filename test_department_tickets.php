<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Exam;
use App\Models\Course;
use App\Models\Student;
use App\Models\Candidate;
use App\Models\StudentCourse;

echo "Testing Department-Based Ticket Generation\n";
echo "==========================================\n\n";

// Check active exam
$activeExam = Exam::where('activated', 'yes')->first();

if (!$activeExam) {
    echo "No active exam found. Please activate an exam first.\n";
    exit;
}

echo "Active Exam Details:\n";
echo "-------------------\n";
echo "Exam ID: {$activeExam->id}\n";
echo "Course ID: {$activeExam->course_id}\n";
echo "Course: {$activeExam->course}\n";
echo "Level ID: " . ($activeExam->level_id ?? 'Not set (all levels)') . "\n\n";

// Get course and enrolled students
$course = Course::find($activeExam->course_id);

if (!$course) {
    echo "Course not found!\n";
    exit;
}

$studentCourses = $course->studentCourses;
echo "Total students enrolled in course: " . $studentCourses->count() . "\n\n";

// Group students by level
echo "Students by Level/Department:\n";
echo "-----------------------------\n";

$studentsByLevel = [];
foreach ($studentCourses as $studentCourse) {
    $student = Student::find($studentCourse->student_id);
    if (!$student) continue;
    
    $levelId = $student->level_id ?? 'No level';
    if (!isset($studentsByLevel[$levelId])) {
        $studentsByLevel[$levelId] = [];
    }
    $studentsByLevel[$levelId][] = $student;
}

foreach ($studentsByLevel as $levelId => $students) {
    echo "\nLevel ID {$levelId}: " . count($students) . " students\n";
    
    foreach ($students as $student) {
        // Check if student has ticket
        $candidate = Candidate::where('student_id', $student->id)
            ->where('exam_id', $activeExam->id)
            ->first();
        
        $hasTicket = $candidate && $candidate->ticket_no;
        $ticketStatus = $hasTicket ? "✓ Ticket: {$candidate->ticket_no}" : "✗ No ticket";
        
        // Check if student should have ticket based on exam level
        $shouldHaveTicket = !$activeExam->level_id || $student->level_id == $activeExam->level_id;
        
        echo "  - {$student->full_name} (ID: {$student->id}) - {$ticketStatus}";
        
        if ($shouldHaveTicket && !$hasTicket) {
            echo " [SHOULD HAVE TICKET]";
        } elseif (!$shouldHaveTicket && $hasTicket) {
            echo " [SHOULD NOT HAVE TICKET - Different level]";
        }
        
        echo "\n";
    }
}

echo "\n\nTicket Generation Summary:\n";
echo "-------------------------\n";

if ($activeExam->level_id) {
    // Exam is for specific level
    $studentsInLevel = StudentCourse::where('course_id', $course->id)
        ->whereHas('student', function($query) use ($activeExam) {
            $query->where('level_id', $activeExam->level_id);
        })->count();
    
    $ticketsInLevel = Candidate::where('exam_id', $activeExam->id)
        ->whereHas('student', function($query) use ($activeExam) {
            $query->where('level_id', $activeExam->level_id);
        })->count();
    
    echo "Exam is for Level ID: {$activeExam->level_id}\n";
    echo "Students in that level enrolled in course: {$studentsInLevel}\n";
    echo "Tickets generated for that level: {$ticketsInLevel}\n";
    
    if ($studentsInLevel == $ticketsInLevel) {
        echo "✓ All students in the level have tickets\n";
    } else {
        echo "❌ Mismatch: Expected {$studentsInLevel} tickets, but found {$ticketsInLevel}\n";
    }
} else {
    // Exam is for all levels
    echo "Exam is for ALL levels\n";
    echo "Total students enrolled: " . $studentCourses->count() . "\n";
    echo "Total tickets generated: " . Candidate::where('exam_id', $activeExam->id)->count() . "\n";
}
