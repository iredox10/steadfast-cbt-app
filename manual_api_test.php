<?php

require_once __DIR__.'/vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;
use App\Models\User;
use App\Models\Exam;
use App\Models\Course;
use App\Models\Student;
use App\Models\StudentCourse;
use App\Models\Candidate;

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

echo "=== MANUAL API ENDPOINT TESTING ===\n\n";

try {
    // Test 1: Simulate get_invigilator endpoint logic
    echo "1. Simulating get_invigilator endpoint (ID: 3):\n";
    $invigilator_id = 3;
    $invigilator = User::findOrFail($invigilator_id);
    $exam = Exam::where('activated', 'yes')->first();
    
    if (!$exam) {
        echo "  No active exam found\n";
    } else {
        $examAssigned = ($invigilator->email == $exam->invigilator);
        echo "  Invigilator: {$invigilator->full_name} ({$invigilator->email})\n";
        echo "  Active Exam: ID {$exam->id}, Course ID {$exam->course_id}\n";
        echo "  Exam Assigned: " . ($examAssigned ? "Yes" : "No") . "\n";
        
        $response1 = [
            'invigilator' => [
                'id' => $invigilator->id,
                'full_name' => $invigilator->full_name,
                'email' => $invigilator->email,
                'role' => $invigilator->role
            ],
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'course_id' => $exam->course_id,
                'activated' => $exam->activated
            ],
            'examAssigned' => $examAssigned
        ];
        
        echo "  Response structure ready\n\n";
        
        // Test 2: Simulate get_students endpoint logic
        $course_id = $exam->course_id;
        echo "2. Simulating invigilator students endpoint (Course ID: {$course_id}):\n";
        
        $course = Course::findOrFail($course_id);
        $studentCourses = $course->studentCourses;
        $student_list = [];
        
        echo "  Found {$studentCourses->count()} student course enrollments\n";
        
        foreach ($studentCourses as $studentCourse) {
            $student = Student::findOrFail($studentCourse->student_id);
            $candidate = Candidate::where('student_id', $student->id)
                ->where('exam_id', $exam->id)
                ->first();
                
            // Add ticket info to student object
            $student->ticket_no = $candidate ? $candidate->ticket_no : null;
            $student->candidate_id = $candidate ? $candidate->id : null;
            
            $student_list[] = $student;
        }
        
        echo "  Processed " . count($student_list) . " students\n";
        
        // Convert to array format
        $studentsArray = [];
        foreach ($student_list as $student) {
            $studentData = $student->toArray();
            if (isset($student->ticket_no)) {
                $studentData['ticket_no'] = $student->ticket_no;
            }
            if (isset($student->candidate_id)) {
                $studentData['candidate_id'] = $student->candidate_id;
            }
            $studentsArray[] = $studentData;
        }
        
        echo "  Final student data array ready\n";
        echo "  Number of students: " . count($studentsArray) . "\n";
        echo "  Sample data:\n";
        echo "    First student: " . ($studentsArray[0]['full_name'] ?? 'N/A') . "\n";
        echo "    Ticket number: " . ($studentsArray[0]['ticket_no'] ?? 'None') . "\n";
        
        echo "\n=== SUMMARY ===\n";
        echo "Both endpoints should be returning data correctly.\n";
        echo "If students aren't showing in the frontend, the issue is likely in:\n";
        echo "1. How the frontend is processing the API responses\n";
        echo "2. Network connectivity to the API endpoints\n";
        echo "3. Authentication/authorization issues\n";
        echo "4. Frontend state management\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}