<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Student;
use App\Models\Exam;
use App\Models\Candidate;

echo "Checking Students and Their Tickets\n";
echo "====================================\n\n";

// Get active exam
$activeExam = Exam::where('activated', 'yes')->first();

if ($activeExam) {
    echo "Active Exam: {$activeExam->course} (ID: {$activeExam->id})\n\n";
}

// Get all students
$students = Student::orderBy('created_at', 'desc')->take(10)->get();

echo "Recent Students:\n";
echo "----------------\n";

foreach ($students as $student) {
    echo "ID: {$student->id}\n";
    echo "Name: {$student->full_name}\n";
    echo "Candidate No: {$student->candidate_no}\n";
    echo "Image: " . ($student->image ?? 'None') . "\n";
    
    if ($activeExam) {
        $candidate = Candidate::where('student_id', $student->id)
            ->where('exam_id', $activeExam->id)
            ->first();
        
        if ($candidate) {
            echo "Ticket No: {$candidate->ticket_no}\n";
            echo "Check-in: {$candidate->checkin_time}\n";
        } else {
            echo "Ticket No: NOT GENERATED\n";
        }
    } else {
        echo "Ticket No: No active exam\n";
    }
    
    echo "---\n";
}

echo "\nSummary:\n";
echo "Total students: " . Student::count() . "\n";
if ($activeExam) {
    $ticketCount = Candidate::where('exam_id', $activeExam->id)->count();
    echo "Students with tickets for active exam: {$ticketCount}\n";
}
