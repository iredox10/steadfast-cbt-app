<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Student;
use App\Models\StudentExamScore;
use App\Models\Answers;
use App\Models\Candidate;

echo "Cleaning Up Incorrect Score Records\n";
echo "====================================\n\n";

$scores = StudentExamScore::all();
$cleaned = 0;
$kept = 0;

foreach ($scores as $score) {
    $student = Student::find($score->student_id);
    
    if (!$student) {
        echo "❌ Deleting score for non-existent student (ID: {$score->student_id})\n";
        $score->delete();
        $cleaned++;
        continue;
    }
    
    // Find candidate records for this student
    $studentCandidates = Candidate::where('student_id', $student->id)->pluck('id');
    
    // Check if student has answers for this course
    $answers = Answers::where('course_id', $score->course_id)
        ->whereIn('candidate_id', $studentCandidates)
        ->get();
    
    if ($answers->count() == 0 && $score->score > 0) {
        echo "❌ {$student->full_name}: Deleting incorrect score of {$score->score} (no answers found)\n";
        $score->delete();
        $cleaned++;
    } elseif ($answers->count() == 0 && $score->score == 0) {
        echo "❌ {$student->full_name}: Deleting zero score with no answers\n";
        $score->delete();
        $cleaned++;
    } else {
        echo "✓ {$student->full_name}: Valid score {$score->score} ({$answers->count()} answers)\n";
        $kept++;
    }
}

echo "\n";
echo "Summary:\n";
echo "--------\n";
echo "Invalid scores cleaned: {$cleaned}\n";
echo "Valid scores kept: {$kept}\n";
echo "\nScore records now in database: " . StudentExamScore::count() . "\n";
