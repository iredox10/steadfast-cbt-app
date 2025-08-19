<?php

require_once __DIR__.'/vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;
use App\Models\User;
use App\Models\Student;
use App\Models\Course;
use App\Models\Exam;
use App\Models\StudentCourse;

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

echo "=== DATABASE CONTENT CHECK ===\n\n";

try {
    // Check users
    echo "Users:\n";
    $users = User::all();
    if ($users->isEmpty()) {
        echo "  No users found\n";
    } else {
        foreach ($users as $user) {
            echo "  - {$user->full_name} ({$user->email}) - Role: {$user->role}\n";
        }
    }
    
    echo "\nStudents:\n";
    $students = Student::all();
    if ($students->isEmpty()) {
        echo "  No students found\n";
    } else {
        foreach ($students as $student) {
            echo "  - {$student->full_name} ({$student->candidate_no})\n";
        }
    }
    
    echo "\nCourses:\n";
    $courses = Course::all();
    if ($courses->isEmpty()) {
        echo "  No courses found\n";
    } else {
        foreach ($courses as $course) {
            echo "  - {$course->title} ({$course->code})\n";
        }
    }
    
    echo "\nExams:\n";
    $exams = Exam::all();
    if ($exams->isEmpty()) {
        echo "  No exams found\n";
    } else {
        foreach ($exams as $exam) {
            echo "  - {$exam->title} (Activated: {$exam->activated})\n";
        }
    }
    
    echo "\nStudent Courses:\n";
    $studentCourses = StudentCourse::all();
    if ($studentCourses->isEmpty()) {
        echo "  No student-course enrollments found\n";
    } else {
        foreach ($studentCourses as $sc) {
            echo "  - Student ID: {$sc->student_id} -> Course ID: {$sc->course_id}\n";
        }
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}