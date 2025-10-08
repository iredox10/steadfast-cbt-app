<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Course;
use App\Models\Student;
use App\Models\StudentCourse;
use App\Models\StudentExamScore;

echo "=== Testing Instructor Students Endpoint ===\n\n";

$user_id = 3; // Lecturer ali
$course_id = 1; // Introduction To Computer Science

echo "Testing with:\n";
echo "  - Lecturer ID: {$user_id}\n";
echo "  - Course ID: {$course_id}\n\n";

// Simulate the get_students endpoint
try {
    $instructor_courses = User::findOrFail($user_id)->courses;
    echo "Instructor courses: " . $instructor_courses->count() . "\n";
    
    $course = Course::findOrFail($course_id);
    echo "Course found: {$course->title}\n\n";
    
    // Get students enrolled in this course
    $students = Course::findOrFail($course_id)->studentCourses;
    echo "Student enrollments: " . $students->count() . "\n";
    
    $student_list = [];
    foreach ($students as $student) {
        $std = Student::findOrFail($student->student_id);
        $student_list[] = $std;
        echo "  - {$std->full_name} ({$std->candidate_no})\n";
    }
    
    echo "\n--- Student List Response ---\n";
    echo json_encode($student_list, JSON_PRETTY_PRINT);
    
} catch (Exception $err) {
    echo "ERROR: " . $err->getMessage() . "\n";
}

echo "\n\n=== Testing get_student_scores_for_course ===\n\n";

try {
    $scores = StudentExamScore::where('course_id', $course_id)->get();
    echo "Scores found: " . $scores->count() . "\n";
    
    $enhancedScores = [];
    foreach ($scores as $score) {
        $student = Student::find($score->student_id);
        if ($student) {
            $enhancedScores[] = [
                'id' => $score->id,
                'student_id' => $student->id,
                'student' => [
                    'id' => $student->id,
                    'full_name' => $student->full_name,
                    'candidate_no' => $student->candidate_no,
                    'department' => $student->department,
                    'programme' => $student->programme,
                ],
                'course_name' => $score->course_name,
                'score' => $score->score,
                'submitted_at' => $score->created_at,
                'updated_at' => $score->updated_at,
            ];
        }
    }
    
    echo "Enhanced scores:\n";
    echo json_encode($enhancedScores, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
