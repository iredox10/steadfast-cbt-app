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

echo "=== POPULATING DATABASE WITH SAMPLE DATA ===\n\n";

try {
    // Get existing data
    $students = Student::all();
    $courses = Course::all();
    $exams = Exam::all();
    
    if ($students->isEmpty()) {
        echo "Creating sample students...\n";
        
        // Create sample students
        $student1 = new Student();
        $student1->candidate_no = 'STU001';
        $student1->full_name = 'John Doe';
        $student1->programme = 'Computer Science';
        $student1->department = 'Science';
        $student1->password = password_hash('password', PASSWORD_DEFAULT);
        $student1->is_logged_on = 'no';
        $student1->save();
        
        $student2 = new Student();
        $student2->candidate_no = 'STU002';
        $student2->full_name = 'Jane Smith';
        $student2->programme = 'Mathematics';
        $student2->department = 'Science';
        $student2->password = password_hash('password', PASSWORD_DEFAULT);
        $student2->is_logged_on = 'no';
        $student2->save();
        
        $students = Student::all();
    }
    
    if ($courses->isEmpty()) {
        echo "Creating sample course...\n";
        
        // Create a sample course
        $course = new Course();
        $course->code = 'CS101';
        $course->title = 'Introduction to Computer Science';
        $course->credit_unit = 3;
        $course->save();
        
        $courses = Course::all();
    }
    
    // Enroll students in courses
    echo "Enrolling students in courses...\n";
    foreach ($students as $student) {
        foreach ($courses as $course) {
            // Check if enrollment already exists
            $existing = StudentCourse::where('student_id', $student->id)
                                    ->where('course_id', $course->id)
                                    ->first();
            
            if (!$existing) {
                $studentCourse = new StudentCourse();
                $studentCourse->student_id = $student->id;
                $studentCourse->course_id = $course->id;
                $studentCourse->save();
                echo "  Enrolled {$student->full_name} in {$course->title}\n";
            }
        }
    }
    
    // Activate an exam if none is active
    $activeExam = Exam::where('activated', 'yes')->first();
    if (!$activeExam && $courses->isNotEmpty()) {
        echo "Creating and activating sample exam...\n";
        
        $exam = new Exam();
        $exam->course_id = $courses->first()->id;
        $exam->user_id = User::where('role', 'lecturer')->first()->id ?? User::first()->id;
        $exam->title = 'Midterm Exam';
        $exam->exam_type = 'Multiple Choice';
        $exam->instruction = 'Answer all questions';
        $exam->max_score = 100;
        $exam->marks_per_question = 5;
        $exam->no_of_question = 20;
        $exam->exam_duration = 60; // 60 minutes
        $exam->activated = 'yes';
        $exam->activated_date = now();
        $exam->save();
    }
    
    echo "\n=== DATA POPULATION COMPLETE ===\n";
    echo "Students: " . Student::count() . "\n";
    echo "Courses: " . Course::count() . "\n";
    echo "Student-Course Enrollments: " . StudentCourse::count() . "\n";
    echo "Active Exams: " . Exam::where('activated', 'yes')->count() . "\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}