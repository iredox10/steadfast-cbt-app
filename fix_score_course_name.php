<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\StudentExamScore;
use App\Models\Course;

echo "=== Fixing Student Exam Score ===\n\n";

$score = StudentExamScore::first();

if ($score) {
    echo "Current score record:\n";
    echo "  - Student ID: {$score->student_id}\n";
    echo "  - Course ID: {$score->course_id}\n";
    echo "  - Course Name: {$score->course_name}\n";
    echo "  - Score: {$score->score}\n\n";
    
    // Get the actual course
    $course = Course::find($score->course_id);
    
    if ($course) {
        echo "Updating course name to: {$course->title}\n";
        $score->course_name = $course->title;
        $score->save();
        echo "✓ Updated successfully!\n";
    } else {
        echo "✗ Course not found!\n";
    }
} else {
    echo "No score records found.\n";
}
