<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Course;
use App\Models\Student;
use App\Models\StudentCourse;
use App\Models\StudentExamScore;

echo "=== Debugging Instructor Students Page ===\n\n";

// Get all instructors
$instructors = User::where('role', 'instructor')->get();
echo "Total Instructors: " . $instructors->count() . "\n";
foreach ($instructors as $instructor) {
    echo "  - ID: {$instructor->id}, Name: {$instructor->full_name}, Email: {$instructor->email}\n";
}
echo "\n";

// Get all courses
$courses = Course::all();
echo "Total Courses: " . $courses->count() . "\n";
foreach ($courses as $course) {
    echo "  - ID: {$course->id}, Title: {$course->title}, Instructor ID: {$course->user_id}\n";
}
echo "\n";

// Get all students
$students = Student::all();
echo "Total Students: " . $students->count() . "\n";
foreach ($students as $student) {
    echo "  - ID: {$student->id}, Name: {$student->full_name}, Candidate No: {$student->candidate_no}\n";
}
echo "\n";

// Get all student-course enrollments
$enrollments = StudentCourse::all();
echo "Total Student-Course Enrollments: " . $enrollments->count() . "\n";
foreach ($enrollments as $enrollment) {
    $student = Student::find($enrollment->student_id);
    $course = Course::find($enrollment->course_id);
    echo "  - Student: {$student->full_name} ({$student->candidate_no}) -> Course: {$course->title}\n";
}
echo "\n";

// Get all student exam scores
$scores = StudentExamScore::all();
echo "Total Student Exam Scores: " . $scores->count() . "\n";
foreach ($scores as $score) {
    $student = Student::find($score->student_id);
    echo "  - Student: {$student->full_name} ({$student->candidate_no}), Course: {$score->course_name}, Score: {$score->score}\n";
}
echo "\n";

// Test the get_students endpoint logic
if ($instructors->count() > 0 && $courses->count() > 0) {
    $testInstructor = $instructors->first();
    $testCourse = $courses->first();
    
    echo "=== Testing get_students endpoint logic ===\n";
    echo "Instructor: {$testInstructor->full_name} (ID: {$testInstructor->id})\n";
    echo "Course: {$testCourse->title} (ID: {$testCourse->id})\n\n";
    
    // Get students for this course
    $courseStudents = Course::findOrFail($testCourse->id)->studentCourses;
    echo "Students enrolled in this course: " . $courseStudents->count() . "\n";
    
    $student_list = [];
    foreach ($courseStudents as $student) {
        $std = Student::find($student->student_id);
        if ($std) {
            $student_list[] = $std;
            echo "  - {$std->full_name} ({$std->candidate_no})\n";
        }
    }
    
    // Get scores for this course
    echo "\nScores for this course:\n";
    $courseScores = StudentExamScore::where('course_id', $testCourse->id)->get();
    echo "Total scores: " . $courseScores->count() . "\n";
    foreach ($courseScores as $score) {
        $student = Student::find($score->student_id);
        if ($student) {
            echo "  - {$student->full_name}: {$score->score}\n";
        }
    }
}

echo "\n=== Debug Complete ===\n";
