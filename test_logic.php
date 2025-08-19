<?php

require_once __DIR__.'/vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;
use App\Models\Course;
use App\Models\Exam;
use App\Models\Student;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Create a service container
$container = new Container();

// Create a database capsule
$capsule = new Capsule($container);
$capsule->addConnection([
    'driver'    => 'pgsql',
    'host'      => $_ENV['DB_HOST'] ?? '127.0.0.1',
    'port'      => $_ENV['DB_PORT'] ?? 5432,
    'database'  => $_ENV['DB_DATABASE'] ?? 'laravel',
    'username'  => $_ENV['DB_USERNAME'] ?? 'laravel',
    'password' => $_ENV['DB_PASSWORD'] ?? 'secret',
    'charset'   => 'utf8',
    'prefix'    => '',
    'schema'    => 'public',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

// Simulate the get_students logic directly
try {
    // Use course ID 1 as in our debug
    $course_id = 1;
    
    echo "Simulating get_students method with course_id: {$course_id}\n";
    
    $course = Course::findOrFail($course_id);
    $students = $course->studentCourses;
    $student_list = [];

    $active_exam = Exam::where('course_id', $course_id)->where('activated', 'yes')->first();

    echo "Course: {$course->title}\n";
    echo "Active exam: " . ($active_exam ? "Yes (ID: {$active_exam->id})" : "No") . "\n";
    echo "Student course enrollments: " . $students->count() . "\n";

    foreach ($students as $student_course) {
        echo "Processing student course enrollment: Student ID {$student_course->student_id}, Course ID {$student_course->course_id}\n";
        $student = Student::findOrFail($student_course->student_id);
        if ($active_exam) {
            $candidate = \App\Models\Candidate::where('student_id', $student->id)
                ->where('exam_id', $active_exam->id)
                ->first();
            $student->ticket_no = $candidate ? $candidate->ticket_no : null;
            // Add candidate ID for potential future use
            $student->candidate_id = $candidate ? $candidate->id : null;
        }
        $student_list[] = $student;
    }

    echo "\n=== RETURNED DATA ===\n";
    echo "Number of students: " . count($student_list) . "\n";
    
    // Convert to array format like the API would return
    $result = [];
    foreach ($student_list as $student) {
        $student_data = $student->toArray();
        // Add ticket_no if it exists as a dynamic property
        if (isset($student->ticket_no)) {
            $student_data['ticket_no'] = $student->ticket_no;
        }
        if (isset($student->candidate_id)) {
            $student_data['candidate_id'] = $student->candidate_id;
        }
        $result[] = $student_data;
    }
    
    echo "JSON Response:\n";
    echo json_encode($result, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}