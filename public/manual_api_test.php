<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Student;
use App\Models\StudentCourse;
use App\Models\Course;

$userId = $_GET['user_id'] ?? 3;
$courseId = $_GET['course_id'] ?? 1;

$response = [
    'test' => 'manual_api_test.php',
    'user_id' => $userId,
    'course_id' => $courseId,
    'timestamp' => date('Y-m-d H:i:s')
];

try {
    // Get the course
    $course = Course::findOrFail($courseId);
    $response['course'] = [
        'id' => $course->id,
        'title' => $course->title,
        'code' => $course->code
    ];
    
    // Get student enrollments
    $studentCourses = StudentCourse::where('course_id', $courseId)->get();
    $response['enrollments_count'] = $studentCourses->count();
    
    // Get students
    $students = [];
    foreach ($studentCourses as $sc) {
        $student = Student::find($sc->student_id);
        if ($student) {
            $students[] = [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'candidate_no' => $student->candidate_no,
                'programme' => $student->programme,
                'department' => $student->department
            ];
        }
    }
    
    $response['students'] = $students;
    $response['students_count'] = count($students);
    $response['success'] = true;
    
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
    $response['success'] = false;
}

echo json_encode($response, JSON_PRETTY_PRINT);
