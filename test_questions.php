<?php
require_once 'vendor/autoload.php';

use App\Models\Question;

// Get a sample question to check its structure
$question = Question::first();

if ($question) {
    echo "Question ID: " . $question->id . "\n";
    echo "Question Text: " . $question->question . "\n";
    echo "Option A: " . $question->option_a . "\n";
    echo "Option B: " . $question->option_b . "\n";
    echo "Option C: " . $question->option_c . "\n";
    echo "Option D: " . $question->option_d . "\n";
    echo "Correct Answer: " . $question->correct_answer . "\n";
} else {
    echo "No questions found in the database.\n";
}
?>
