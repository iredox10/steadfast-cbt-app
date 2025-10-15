<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Exam;
use App\Models\Student;
use App\Models\StudentCourse;
use App\Models\Candidate;

echo "Reactivating Exam to Generate Tickets\n";
echo "======================================\n\n";

// Get active exam
$activeExam = Exam::where('activated', 'yes')->first();

if (!$activeExam) {
    echo "❌ No active exam found!\n";
    exit;
}

echo "Exam ID: {$activeExam->id}\n";
echo "Course ID: {$activeExam->course_id}\n";
echo "Level ID: {$activeExam->level_id}\n\n";

// Simulate the activation logic from Admin controller
$course = \App\Models\Course::find($activeExam->course_id);
$studentCourses = $course->studentCourses;

echo "Generating tickets for students...\n";
echo str_repeat('-', 70) . "\n\n";

$ticketsGenerated = 0;
$ticketsSkipped = 0;

foreach ($studentCourses as $studentCourse) {
    $student = Student::find($studentCourse->student_id);
    
    if (!$student) {
        continue;
    }
    
    // Filter by level_id (department) - only students in the exam's level should get tickets
    if ($activeExam->level_id && $student->level_id != $activeExam->level_id) {
        echo "  ⊘ {$student->full_name} - Skipped (Level {$student->level_id}, exam is for Level {$activeExam->level_id})\n";
        $ticketsSkipped++;
        continue;
    }
    
    // Check if ticket already exists
    $existingCandidate = Candidate::where('student_id', $student->id)
        ->where('exam_id', $activeExam->id)
        ->first();
    
    if ($existingCandidate && $existingCandidate->ticket_no) {
        echo "  ✓ {$student->full_name} - Already has ticket {$existingCandidate->ticket_no}\n";
        continue;
    }
    
    // Generate unique 6-digit ticket
    do {
        $ticket = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    } while (Candidate::where('exam_id', $activeExam->id)
        ->where('ticket_no', $ticket)
        ->exists());
    
    // Create or update candidate
    $candidate = Candidate::updateOrCreate(
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
            'ticket_no' => $ticket,
            'status' => 'pending',
        ]
    );
    
    echo "  ✅ {$student->full_name} - NEW TICKET: {$ticket}\n";
    $ticketsGenerated++;
}

echo "\n" . str_repeat('=', 70) . "\n";
echo "SUMMARY:\n";
echo str_repeat('=', 70) . "\n";
echo "New tickets generated: {$ticketsGenerated}\n";
echo "Students skipped (wrong department): {$ticketsSkipped}\n";
echo "Total tickets for this exam: " . Candidate::where('exam_id', $activeExam->id)->whereNotNull('ticket_no')->count() . "\n";
