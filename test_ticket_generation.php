<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Exam;
use App\Models\Course;
use App\Models\Student;
use App\Models\Candidate;

echo "Testing Ticket Generation on Exam Activation\n";
echo "=============================================\n\n";

// Find an active exam
$activeExam = Exam::where('activated', 'yes')->first();

if ($activeExam) {
    echo "Active Exam Found:\n";
    echo "Exam ID: {$activeExam->id}\n";
    echo "Course ID: {$activeExam->course_id}\n";
    echo "Course: {$activeExam->course}\n\n";
    
    // Get students enrolled in this course
    $course = Course::find($activeExam->course_id);
    if ($course) {
        $studentCourses = $course->studentCourses;
        echo "Students enrolled in this course: " . $studentCourses->count() . "\n\n";
        
        // Check candidates for this exam
        $candidates = Candidate::where('exam_id', $activeExam->id)->get();
        echo "Candidates with tickets generated: " . $candidates->count() . "\n\n";
        
        echo "Candidate Details:\n";
        echo "-----------------\n";
        foreach ($candidates as $candidate) {
            $student = Student::find($candidate->student_id);
            echo "Student: {$student->full_name}\n";
            echo "Ticket No: {$candidate->ticket_no}\n";
            echo "Checked In: {$candidate->checkin_time}\n";
            echo "---\n";
        }
    }
} else {
    echo "No active exam found.\n";
    echo "Activate an exam first to see ticket generation.\n";
}
