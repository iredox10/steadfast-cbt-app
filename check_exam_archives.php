<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\ExamArchive;

echo "=== Checking Exam Archives ===\n\n";

$archives = ExamArchive::all();
echo "Total Archives: " . $archives->count() . "\n\n";

foreach ($archives as $archive) {
    echo "Archive ID: {$archive->id}\n";
    echo "Exam Title: {$archive->exam_title}\n";
    echo "Course Title: {$archive->course_title}\n";
    echo "Exam Date: {$archive->exam_date}\n";
    echo "Duration: {$archive->duration}\n";
    
    $studentResults = $archive->student_results;
    if (is_array($studentResults)) {
        echo "Student Results Count: " . count($studentResults) . "\n";
        if (count($studentResults) > 0) {
            echo "Sample Result:\n";
            echo json_encode($studentResults[0], JSON_PRETTY_PRINT);
        }
    } else {
        echo "Student Results: " . json_encode($studentResults) . "\n";
    }
    echo "\n---\n\n";
}

if ($archives->count() == 0) {
    echo "No exam archives found in the database.\n";
    echo "Archives are created when exams are completed and archived.\n";
}
