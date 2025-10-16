<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Exam;
use App\Models\Course;
use App\Models\Student;
use App\Models\ExamTicket;

$examId = 5;
$exam = Exam::find($examId);

if (!$exam) {
    echo "Exam not found\n";
    exit;
}

echo "=== EXAM INFORMATION ===\n";
echo "Exam ID: {$exam->id}\n";
echo "Course ID: {$exam->course_id}\n";
echo "Level ID: " . ($exam->level_id ?? 'Not set') . "\n";
echo "Activated: {$exam->activated}\n\n";

$course = Course::find($exam->course_id);

if ($course) {
    echo "=== COURSE INFORMATION ===\n";
    echo "Course: {$course->course_code} - {$course->course_name}\n";
    echo "Level ID: " . ($course->level_id ?? 'Not set') . "\n\n";
    
    echo "=== ENROLLMENT CHECK ===\n";
    $studentCourses = $course->studentCourses;
    echo "Total enrolled (from student_courses table): {$studentCourses->count()}\n\n";
    
    if ($studentCourses->count() > 0) {
        echo "First 10 enrolled students:\n";
        $count = 0;
        foreach ($studentCourses->take(10) as $sc) {
            $student = Student::find($sc->student_id);
            if ($student) {
                $levelMatch = (!$exam->level_id || $student->level_id == $exam->level_id) ? '✓' : '✗';
                echo "  {$levelMatch} Student ID: {$student->id} - {$student->full_name} - Level: " . ($student->level_id ?? 'Not set') . "\n";
            } else {
                echo "  ✗ Student ID {$sc->student_id} not found in students table\n";
            }
        }
    }
    
    echo "\n=== ELIGIBLE STUDENTS COUNT ===\n";
    $eligibleCount = 0;
    foreach ($studentCourses as $sc) {
        $student = Student::find($sc->student_id);
        if ($student) {
            if (!$exam->level_id || $student->level_id == $exam->level_id) {
                $eligibleCount++;
            }
        }
    }
    echo "Eligible students (matching level filter): {$eligibleCount}\n";
}

echo "\n=== TICKETS GENERATED ===\n";
$tickets = ExamTicket::where('exam_id', $exam->id)->get();
echo "Total tickets: {$tickets->count()}\n";
echo "Available: " . $tickets->where('is_used', false)->count() . "\n";
echo "Used: " . $tickets->where('is_used', true)->count() . "\n";

if ($tickets->count() > 0) {
    echo "\nTicket numbers:\n";
    foreach ($tickets->take(10) as $ticket) {
        $status = $ticket->is_used ? 'Used' : 'Available';
        echo "  - {$ticket->ticket_no} ({$status})\n";
    }
}

echo "\n=== RECOMMENDATION ===\n";
if ($eligibleCount > $tickets->count()) {
    echo "⚠️  WARNING: {$eligibleCount} eligible students but only {$tickets->count()} tickets!\n";
    echo "   You should regenerate tickets. Run: php regenerate_tickets.php {$examId}\n";
} elseif ($eligibleCount < $tickets->count()) {
    echo "ℹ️  INFO: {$tickets->count()} tickets for {$eligibleCount} eligible students (extra tickets exist)\n";
} else {
    echo "✓ GOOD: Tickets match eligible students ({$eligibleCount})\n";
}
