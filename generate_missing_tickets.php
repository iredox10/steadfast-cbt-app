<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Student;
use App\Models\Exam;
use App\Models\Candidate;
use App\Models\Course;

echo "Generating Tickets for Students Without Tickets\n";
echo "================================================\n\n";

// Get active exam
$activeExam = Exam::where('activated', 'yes')->first();

if (!$activeExam) {
    echo "No active exam found. Please activate an exam first.\n";
    exit;
}

echo "Active Exam: {$activeExam->course} (ID: {$activeExam->id})\n\n";

// Get students enrolled in the exam's course only
$course = \App\Models\Course::find($activeExam->course_id);
if (!$course) {
    echo "Course not found for this exam.\n";
    exit;
}

$studentCourses = $course->studentCourses;
$generated = 0;
$skipped = 0;
$notEnrolled = 0;

foreach ($studentCourses as $studentCourse) {
    $student = Student::find($studentCourse->student_id);
    
    if (!$student) {
        continue;
    }

    // Check if student already has a ticket for this exam
    $existingCandidate = Candidate::where('student_id', $student->id)
        ->where('exam_id', $activeExam->id)
        ->first();

    if ($existingCandidate && $existingCandidate->ticket_no) {
        echo "✓ {$student->full_name} - Already has ticket: {$existingCandidate->ticket_no}\n";
        $skipped++;
        continue;
    }

    // Generate a unique 6-digit ticket number
    do {
        $ticket_no = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    } while (Candidate::where('exam_id', $activeExam->id)->where('ticket_no', $ticket_no)->exists());

    // Create or update candidate record
    Candidate::updateOrCreate(
        [
            'student_id' => $student->id,
            'exam_id' => $activeExam->id,
        ],
        [
            'full_name' => $student->full_name,
            'programme' => $student->programme,
            'department' => $student->department,
            'password' => $student->password,
            'is_logged_on' => 0,
            'is_checkout' => 0,
            'checkin_time' => now(),
            'checkout_time' => '',
            'ticket_no' => $ticket_no,
            'status' => 'pending',
        ]
    );

    echo "✓ {$student->full_name} - Generated ticket: {$ticket_no}\n";
    $generated++;
}

echo "\n";
echo "Summary:\n";
echo "--------\n";
echo "New tickets generated: {$generated}\n";
echo "Students with existing tickets: {$skipped}\n";
echo "Total students enrolled in course: " . $studentCourses->count() . "\n";
