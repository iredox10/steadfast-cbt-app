<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Exam;
use App\Models\Candidate;
use App\Models\ExamArchive;

echo "Checking Exam Termination and Ticket Removal\n";
echo "=============================================\n\n";

// Check active exam
$activeExam = Exam::where('activated', 'yes')->first();

if ($activeExam) {
    echo "Active Exam Found:\n";
    echo "Exam ID: {$activeExam->id}\n";
    echo "Course: {$activeExam->course}\n";
    echo "Activated Date: {$activeExam->activated_date}\n\n";
    
    // Count candidates/tickets for this exam
    $candidateCount = Candidate::where('exam_id', $activeExam->id)->count();
    echo "Current Tickets/Candidates: {$candidateCount}\n\n";
    
    if ($candidateCount > 0) {
        echo "Tickets in System:\n";
        $candidates = Candidate::where('exam_id', $activeExam->id)->get();
        foreach ($candidates as $candidate) {
            echo "  - {$candidate->full_name}: {$candidate->ticket_no}\n";
        }
    }
} else {
    echo "No active exam found.\n";
}

echo "\n";
echo "Terminated Exams (Archived):\n";
echo "----------------------------\n";

$terminatedExams = Exam::where('activated', 'no')
    ->whereNotNull('finished_time')
    ->orderBy('finished_time', 'desc')
    ->take(5)
    ->get();

if ($terminatedExams->count() > 0) {
    foreach ($terminatedExams as $exam) {
        echo "\nExam ID: {$exam->id}\n";
        echo "Course: {$exam->course}\n";
        echo "Finished: {$exam->finished_time}\n";
        
        // Check if there are any remaining candidates (there shouldn't be)
        $remainingCandidates = Candidate::where('exam_id', $exam->id)->count();
        if ($remainingCandidates > 0) {
            echo "❌ WARNING: {$remainingCandidates} candidates still in database (should be 0)\n";
        } else {
            echo "✓ All tickets properly removed\n";
        }
        
        // Check if archived
        $archived = ExamArchive::where('exam_id', $exam->id)->first();
        if ($archived) {
            echo "✓ Exam archived with " . count($archived->student_results) . " student results\n";
        } else {
            echo "❌ No archive found\n";
        }
    }
} else {
    echo "No terminated exams found.\n";
}

echo "\n";
echo "Summary:\n";
echo "--------\n";
echo "Total exams: " . Exam::count() . "\n";
echo "Active exams: " . Exam::where('activated', 'yes')->count() . "\n";
echo "Terminated exams: " . Exam::where('activated', 'no')->whereNotNull('finished_time')->count() . "\n";
echo "Total candidates in system: " . Candidate::count() . "\n";
echo "Archived exams: " . ExamArchive::count() . "\n";
