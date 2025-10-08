<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\Student;
use App\Models\Exam;
use App\Models\Course;
use App\Models\StudentCourse;

// Load Laravel environment
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Debug Invigilator Student Visibility ===\n\n";

// Check students
$students = Student::all();
echo "Total students: " . $students->count() . "\n";
foreach ($students as $student) {
    echo "  - {$student->full_name} | candidate_no: {$student->candidate_no} | level_id: " . ($student->level_id ?? 'NULL') . "\n";
}

// Check active exams
echo "\nActive exams:\n";
$activeExams = Exam::where('activated', 'yes')->get();
foreach ($activeExams as $exam) {
    echo "  - Exam ID: {$exam->id} | Course ID: {$exam->course_id} | Level ID: " . ($exam->level_id ?? 'NULL') . "\n";
}

// Check student course enrollments
echo "\nStudent-Course enrollments:\n";
$enrollments = StudentCourse::all();
foreach ($enrollments as $enrollment) {
    $student = Student::find($enrollment->student_id);
    $course = Course::find($enrollment->course_id);
    echo "  - Student: {$student->full_name} → Course: {$course->title}\n";
}

echo "\n";
