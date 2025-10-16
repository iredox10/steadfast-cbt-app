<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Course;
use App\Models\Student;
use App\Models\Exam;
use App\Models\ExamTicket;

// Get the active exam
$exam = Exam::where('activated', 'yes')->first();

if (!$exam) {
    echo "No active exam found.\n";
    exit;
}

echo "Active Exam ID: {$exam->id}\n";
echo "Course ID: {$exam->course_id}\n";
echo "Level ID: {$exam->level_id}\n\n";

// Get the course
$course = Course::find($exam->course_id);

if (!$course) {
    echo "Course not found.\n";
    exit;
}

echo "Course: {$course->course_code} - {$course->course_name}\n\n";

// Get student enrollments
$studentCourses = $course->studentCourses;
echo "Total student enrollments: " . $studentCourses->count() . "\n\n";

// Count eligible students
$eligibleStudents = 0;
$ineligibleStudents = 0;

echo "Checking each enrolled student:\n";
echo str_repeat("-", 80) . "\n";

foreach ($studentCourses as $studentCourse) {
    $student = Student::find($studentCourse->student_id);
    
    if (!$student) {
        echo "Student ID {$studentCourse->student_id}: NOT FOUND in students table\n";
        $ineligibleStudents++;
        continue;
    }
    
    // Check level match if exam has level_id
    if ($exam->level_id && $student->level_id != $exam->level_id) {
        echo "Student {$student->candidate_no} ({$student->full_name}): LEVEL MISMATCH (Student Level: {$student->level_id}, Exam Level: {$exam->level_id})\n";
        $ineligibleStudents++;
        continue;
    }
    
    echo "Student {$student->candidate_no} ({$student->full_name}): ELIGIBLE (Level: {$student->level_id})\n";
    $eligibleStudents++;
}

echo str_repeat("-", 80) . "\n";
echo "\nSummary:\n";
echo "Total Enrollments: " . $studentCourses->count() . "\n";
echo "Eligible Students: {$eligibleStudents}\n";
echo "Ineligible Students: {$ineligibleStudents}\n\n";

// Check existing tickets
$existingTickets = ExamTicket::where('exam_id', $exam->id)->count();
echo "Existing Tickets Generated: {$existingTickets}\n\n";

if ($existingTickets != $eligibleStudents) {
    echo "⚠️  WARNING: Ticket count ({$existingTickets}) does not match eligible students ({$eligibleStudents})\n";
} else {
    echo "✓ Ticket count matches eligible students\n";
}

