<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Exam;
use App\Models\Candidate;
use App\Models\Student;

echo "Cleaning Up Tickets for Wrong Departments\n";
echo "==========================================\n\n";

// Get active exam
$activeExam = Exam::where('activated', 'yes')->first();

if (!$activeExam) {
    echo "No active exam found.\n";
    exit;
}

echo "Active Exam ID: {$activeExam->id}\n";
echo "Exam Level ID: " . ($activeExam->level_id ?? 'Not set (all levels)') . "\n\n";

if (!$activeExam->level_id) {
    echo "Exam has no level restriction - all tickets are valid.\n";
    exit;
}

// Find candidates from wrong levels
$candidates = Candidate::where('exam_id', $activeExam->id)->get();
$deleted = 0;
$kept = 0;

echo "Checking candidates:\n";
echo "-------------------\n";

foreach ($candidates as $candidate) {
    $student = Student::find($candidate->student_id);
    
    if (!$student) {
        echo "✗ Deleting candidate for non-existent student (ID: {$candidate->student_id})\n";
        $candidate->delete();
        $deleted++;
        continue;
    }
    
    if ($student->level_id != $activeExam->level_id) {
        echo "✗ {$student->full_name}: Removing ticket (Level {$student->level_id}, exam is for Level {$activeExam->level_id})\n";
        $candidate->delete();
        $deleted++;
    } else {
        echo "✓ {$student->full_name}: Keeping ticket {$candidate->ticket_no} (correct level)\n";
        $kept++;
    }
}

echo "\n";
echo "Summary:\n";
echo "--------\n";
echo "Tickets removed (wrong level): {$deleted}\n";
echo "Tickets kept (correct level): {$kept}\n";
echo "Total remaining tickets: " . Candidate::where('exam_id', $activeExam->id)->count() . "\n";
