<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\ExamArchive;
use App\Models\Exam;
use App\Models\Course;
use App\Models\Student;
use App\Models\StudentExamScore;
use App\Models\Candidate;

echo "=== Populating Exam Archive with Student Results ===\n\n";

$archives = ExamArchive::all();

foreach ($archives as $archive) {
    echo "Processing Archive ID: {$archive->id}\n";
    echo "Exam: {$archive->exam_title}\n";
    echo "Course: {$archive->course_title}\n\n";
    
    // Find the exam
    $exam = Exam::find($archive->exam_id);
    
    if (!$exam) {
        echo "  ✗ Exam not found (ID: {$archive->exam_id})\n";
        continue;
    }
    
    // Get the course
    $course = Course::find($exam->course_id);
    
    if (!$course) {
        echo "  ✗ Course not found (ID: {$exam->course_id})\n";
        continue;
    }
    
    echo "  Found exam and course\n";
    echo "  Course ID: {$course->id}\n";
    
    // Get all scores for this course
    $scores = StudentExamScore::where('course_id', $course->id)->get();
    echo "  Scores found: {$scores->count()}\n";
    
    $studentResults = [];
    
    foreach ($scores as $score) {
        $student = Student::find($score->student_id);
        
        if ($student) {
            $studentResults[] = [
                'student_id' => $student->id,
                'candidate_no' => $student->candidate_no,
                'full_name' => $student->full_name,
                'score' => $score->score,
                'submission_time' => $score->created_at->toDateTimeString(),
            ];
        }
    }
    
    echo "  Student results prepared: " . count($studentResults) . "\n";
    
    // Update the archive
    $archive->student_results = $studentResults;
    $archive->save();
    
    echo "  ✓ Archive updated successfully!\n\n";
    echo "---\n\n";
}

echo "=== Complete ===\n";
