<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Course;
use App\Models\Student;
use App\Models\StudentCourse;

echo "Testing Student Enrollment Endpoints\n";
echo "=====================================\n\n";

// Test with a known course ID
$courseId = 4; // Change this to your actual course ID

try {
    echo "1. Testing get_course_students for course ID: {$courseId}\n";
    echo str_repeat('-', 70) . "\n";
    
    $course = Course::find($courseId);
    if (!$course) {
        echo "❌ Course not found!\n";
        exit;
    }
    
    echo "Course: {$course->title} (Code: {$course->code})\n\n";
    
    // Get enrolled students
    $studentCourses = $course->studentCourses;
    echo "Enrolled Students: {$studentCourses->count()}\n";
    
    $enrolledStudents = [];
    foreach ($studentCourses as $studentCourse) {
        $student = Student::find($studentCourse->student_id);
        if ($student) {
            $enrolledStudents[] = $student;
            echo "  - {$student->full_name} (ID: {$student->id})\n";
        }
    }
    
    echo "\n";
    
    // Test unenrolled students query
    echo "2. Testing getUnenrolledStudents\n";
    echo str_repeat('-', 70) . "\n";
    
    $enrolledStudentIds = StudentCourse::where('course_id', $courseId)
        ->pluck('student_id')
        ->toArray();
    
    echo "Enrolled student IDs: " . implode(', ', $enrolledStudentIds) . "\n\n";
    
    $unenrolledStudents = Student::whereNotIn('id', $enrolledStudentIds)
        ->orderBy('full_name', 'asc')
        ->get();
    
    echo "Unenrolled Students: {$unenrolledStudents->count()}\n";
    foreach ($unenrolledStudents as $student) {
        echo "  - {$student->full_name} (ID: {$student->id}, Level: {$student->level_id})\n";
    }
    
    echo "\n";
    echo "✅ All queries executed successfully!\n\n";
    
    // Test the JSON response format
    echo "3. Testing JSON Response Format\n";
    echo str_repeat('-', 70) . "\n";
    
    $enrolledJson = json_encode($enrolledStudents);
    echo "Enrolled Students JSON length: " . strlen($enrolledJson) . " characters\n";
    
    $unenrolledJson = json_encode($unenrolledStudents);
    echo "Unenrolled Students JSON length: " . strlen($unenrolledJson) . " characters\n";
    
    echo "\n✅ JSON encoding successful!\n";
    
} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
}
