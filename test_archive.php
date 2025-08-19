<?php
require_once 'vendor/autoload.php';

use App\Models\ExamArchive;

// Test what data is in the exam archives
try {
    $archives = ExamArchive::all();
    
    echo "Total archives: " . $archives->count() . "\n\n";
    
    foreach ($archives as $archive) {
        echo "Archive ID: " . $archive->id . "\n";
        echo "Exam Title: " . $archive->exam_title . "\n";
        echo "Course Title: " . $archive->course_title . "\n";
        echo "Exam Date: " . $archive->exam_date . "\n";
        
        // Check if student_results exists and what it contains
        if ($archive->student_results) {
            echo "Student results count: " . count($archive->student_results) . "\n";
            echo "First student result: \n";
            if (count($archive->student_results) > 0) {
                print_r($archive->student_results[0]);
            }
        } else {
            echo "No student results found\n";
        }
        
        echo str_repeat("-", 50) . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}