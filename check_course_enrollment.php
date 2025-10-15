<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Student;
use App\Models\Exam;
use App\Models\Candidate;
use App\Models\Course;

echo "Students Enrolled in Active Exam Course\n";
echo "========================================\n\n";

// Get active exam
$activeExam = Exam::where('activated', 'yes')->first();

if (!$activeExam) {
    echo "No active exam found.\n";
    exit;
}

echo "Active Exam Details:\n";
echo "Exam ID: {$activeExam->id}\n";
echo "Course ID: {$activeExam->course_id}\n";
echo "Course: {$activeExam->course}\n\n";

// Get the course
$course = Course::find($activeExam->course_id);

if (!$course) {
    echo "Course not found!\n";
    exit;
}

// Get students enrolled in this course
$studentCourses = $course->studentCourses;

echo "Students Enrolled in This Course:\n";
echo "----------------------------------\n";

$withTickets = 0;
$withoutTickets = 0;

foreach ($studentCourses as $studentCourse) {
    $student = Student::find($studentCourse->student_id);
    
    if (!$student) {
        continue;
    }

    echo "\n{$student->full_name} (ID: {$student->id})\n";
    echo "  Candidate No: {$student->candidate_no}\n";
    echo "  Department: {$student->department}\n";
    echo "  Image: " . ($student->image ? 'Yes' : 'No') . "\n";
    
    // Check for ticket
    $candidate = Candidate::where('student_id', $student->id)
        ->where('exam_id', $activeExam->id)
        ->first();
    
    if ($candidate && $candidate->ticket_no) {
        echo "  Ticket: {$candidate->ticket_no} ✓\n";
        $withTickets++;
    } else {
        echo "  Ticket: NOT GENERATED ✗\n";
        $withoutTickets++;
    }
}

echo "\n";
echo "Summary:\n";
echo "--------\n";
echo "Total enrolled students: " . $studentCourses->count() . "\n";
echo "Students with tickets: {$withTickets}\n";
echo "Students without tickets: {$withoutTickets}\n";

echo "\n";
echo "All Students in Database:\n";
echo "-------------------------\n";
$allStudents = Student::all();
$notEnrolled = 0;

foreach ($allStudents as $student) {
    $isEnrolled = \App\Models\StudentCourse::where('student_id', $student->id)
        ->where('course_id', $activeExam->course_id)
        ->exists();
    
    if (!$isEnrolled) {
        echo "{$student->full_name} - NOT enrolled in active exam course\n";
        $notEnrolled++;
    }
}

if ($notEnrolled == 0) {
    echo "All students are enrolled in the active exam course.\n";
} else {
    echo "\nTotal students not enrolled: {$notEnrolled}\n";
}
