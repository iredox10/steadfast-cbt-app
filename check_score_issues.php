<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Student;
use App\Models\StudentExamScore;
use App\Models\Answers;
use App\Models\Candidate;
use App\Models\Exam;

echo "Checking Student Scores and Answers\n";
echo "====================================\n\n";

// Get all students with scores
$scores = StudentExamScore::all();

echo "All Student Scores in Database:\n";
echo "-------------------------------\n";

foreach ($scores as $score) {
    $student = Student::find($score->student_id);
    
    if (!$student) {
        echo "Score ID {$score->id}: Student not found (student_id: {$score->student_id})\n";
        continue;
    }
    
    echo "\nStudent: {$student->full_name} (ID: {$student->id})\n";
    echo "Course ID: {$score->course_id}\n";
    echo "Score: {$score->score}\n";
    
    // Check if student has answered questions for this course
    // First find candidate records for this student
    $studentCandidates = Candidate::where('student_id', $student->id)->pluck('id');
    
    $answers = Answers::where('course_id', $score->course_id)
        ->whereIn('candidate_id', $studentCandidates)
        ->get();
    
    echo "Total Answers: " . $answers->count() . "\n";
    
    if ($answers->count() > 0) {
        $correctAnswers = $answers->where('is_correct', true)->count();
        echo "Correct Answers: {$correctAnswers}\n";
        
        // Get exam to check marks per question
        $exam = Exam::where('course_id', $score->course_id)->first();
        if ($exam) {
            $expectedScore = $correctAnswers * $exam->marks_per_question;
            echo "Expected Score: {$expectedScore} ({$correctAnswers} × {$exam->marks_per_question})\n";
            
            if ($score->score != $expectedScore) {
                echo "❌ MISMATCH: Stored score ({$score->score}) doesn't match expected ({$expectedScore})\n";
            } else {
                echo "✓ Score matches calculation\n";
            }
        }
    } else {
        echo "⚠️ No answers found but score is {$score->score}\n";
        if ($score->score > 0) {
            echo "❌ PROBLEM: Student has score but no answers!\n";
        }
    }
    
    echo "---\n";
}

echo "\n\nDetailed Investigation for Scores > 0 with No Answers:\n";
echo "=======================================================\n";

foreach ($scores as $score) {
    if ($score->score > 0) {
        $student = Student::find($score->student_id);
        if (!$student) continue;
        
        // Check all possible candidates for this student
        $candidates = Candidate::where('student_id', $student->id)->get();
        
        if ($candidates->isEmpty()) {
            echo "\n{$student->full_name}: No candidate records found\n";
            continue;
        }
        
        $foundAnswers = false;
        foreach ($candidates as $candidate) {
            $answers = Answers::where('candidate_id', $candidate->id)
                ->where('course_id', $score->course_id)
                ->get();
            
            if ($answers->count() > 0) {
                $foundAnswers = true;
                echo "\n{$student->full_name}: Found {$answers->count()} answers via candidate ID {$candidate->id}\n";
            }
        }
        
        if (!$foundAnswers) {
            echo "\n⚠️ {$student->full_name}: Has score {$score->score} but NO answers found in any candidate record\n";
            echo "   This might be old/incorrect data\n";
        }
    }
}

echo "\n\nSummary:\n";
echo "--------\n";
echo "Total scores in database: " . $scores->count() . "\n";
echo "Students: " . Student::count() . "\n";
echo "Active candidates: " . Candidate::count() . "\n";
