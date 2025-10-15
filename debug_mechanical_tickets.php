<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Exam;
use App\Models\Course;
use App\Models\Student;
use App\Models\Candidate;
use App\Models\StudentCourse;

echo "Debugging Mechanical Engineering Ticket Issue\n";
echo "==============================================\n\n";

// Get active exam
$activeExam = Exam::where('activated', 'yes')->first();

if (!$activeExam) {
    echo "❌ No active exam found!\n";
    exit;
}

echo "Active Exam Details:\n";
echo "-------------------\n";
echo "Exam ID: {$activeExam->id}\n";
echo "Course ID: {$activeExam->course_id}\n";
echo "Exam Level ID: " . ($activeExam->level_id ?? 'Not set (all levels)') . "\n\n";

// Get course details
$course = Course::find($activeExam->course_id);
echo "Course: " . ($course ? $course->course_name : 'N/A') . "\n\n";

// Get all students enrolled in the course
$enrolledStudents = StudentCourse::where('course_id', $activeExam->course_id)->get();

echo "Students Enrolled in Course: {$enrolledStudents->count()}\n";
echo "----------------------------------------\n\n";

// Group by level/department
$studentsByLevel = [];
foreach ($enrolledStudents as $enrollment) {
    $student = Student::find($enrollment->student_id);
    if (!$student) continue;
    
    $levelId = $student->level_id ?? 'NULL';
    if (!isset($studentsByLevel[$levelId])) {
        $studentsByLevel[$levelId] = [];
    }
    $studentsByLevel[$levelId][] = $student;
}

// Show breakdown by level
foreach ($studentsByLevel as $levelId => $students) {
    echo "Level/Department ID: {$levelId}\n";
    echo str_repeat('-', 50) . "\n";
    
    foreach ($students as $student) {
        // Check if they have a ticket
        $candidate = Candidate::where('student_id', $student->id)
            ->where('exam_id', $activeExam->id)
            ->first();
        
        $ticketStatus = $candidate && $candidate->ticket_no ? 
            "✓ Ticket: {$candidate->ticket_no}" : 
            "✗ NO TICKET";
        
        // Check if they should have a ticket based on exam level
        $shouldHaveTicket = !$activeExam->level_id || $student->level_id == $activeExam->level_id;
        $statusIcon = $shouldHaveTicket ? '✓ SHOULD HAVE' : '✗ SHOULD NOT HAVE';
        
        echo "  - {$student->full_name} (ID: {$student->id})\n";
        echo "    Student Level: {$student->level_id}\n";
        echo "    {$ticketStatus}\n";
        echo "    Expected: {$statusIcon}\n";
        echo "    Department: {$student->department}\n\n";
    }
}

// Summary
echo "\n" . str_repeat('=', 50) . "\n";
echo "SUMMARY\n";
echo str_repeat('=', 50) . "\n";

$totalEnrolled = $enrolledStudents->count();
$totalWithTickets = Candidate::where('exam_id', $activeExam->id)
    ->whereNotNull('ticket_no')
    ->count();

echo "Total Students Enrolled: {$totalEnrolled}\n";
echo "Students with Tickets: {$totalWithTickets}\n";
echo "Students WITHOUT Tickets: " . ($totalEnrolled - $totalWithTickets) . "\n\n";

if ($activeExam->level_id) {
    // Count students in the exam's level
    $studentsInExamLevel = 0;
    $ticketsInExamLevel = 0;
    
    foreach ($enrolledStudents as $enrollment) {
        $student = Student::find($enrollment->student_id);
        if (!$student) continue;
        
        if ($student->level_id == $activeExam->level_id) {
            $studentsInExamLevel++;
            
            $candidate = Candidate::where('student_id', $student->id)
                ->where('exam_id', $activeExam->id)
                ->first();
            
            if ($candidate && $candidate->ticket_no) {
                $ticketsInExamLevel++;
            }
        }
    }
    
    echo "Students in Exam's Level ({$activeExam->level_id}): {$studentsInExamLevel}\n";
    echo "Tickets Generated for Exam's Level: {$ticketsInExamLevel}\n";
    
    if ($ticketsInExamLevel < $studentsInExamLevel) {
        echo "\n⚠️  WARNING: " . ($studentsInExamLevel - $ticketsInExamLevel) . " students in the target level still need tickets!\n";
    }
}
