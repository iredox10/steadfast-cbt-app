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

echo "=== DEBUGGING INVIGILATOR STUDENT FETCH ===\n\n";

try {
    // Check what data we have
    echo "Courses:\n";
    $courses = Course::all();
    foreach ($courses as $course) {
        echo "  ID: {$course->id} - {$course->title} ({$course->code})\n";
    }
    
    echo "\nActive Exams:\n";
    $activeExams = Exam::where('activated', 'yes')->get();
    foreach ($activeExams as $exam) {
        echo "  ID: {$exam->id} - Course ID: {$exam->course_id} - Title: {$exam->title}\n";
    }
    
    if ($courses->isNotEmpty()) {
        $course_id = $courses->first()->id;
        echo "\n=== TESTING get_students METHOD FOR COURSE ID: {$course_id} ===\n";
        
        // Simulate the get_students method logic
        $course = Course::findOrFail($course_id);
        echo "Course found: {$course->title}\n";
        
        $students = $course->studentCourses;
        echo "Student course enrollments found: " . $students->count() . "\n";
        
        $student_list = [];
        $active_exam = Exam::where('course_id', $course_id)->where('activated', 'yes')->first();
        
        if ($active_exam) {
            echo "Active exam found: ID {$active_exam->id}\n";
        } else {
            echo "No active exam found for this course\n";
        }
        
        foreach ($students as $student_course) {
            echo "Processing student course enrollment: Student ID {$student_course->student_id}, Course ID {$student_course->course_id}\n";
            $student = Student::find($student_course->student_id);
            if ($student) {
                echo "  Student found: {$student->full_name} ({$student->candidate_no})\n";
                if ($active_exam) {
                    $candidate = \App\Models\Candidate::where('student_id', $student->id)
                        ->where('exam_id', $active_exam->id)
                        ->first();
                    if ($candidate) {
                        echo "    Candidate record found with ticket: {$candidate->ticket_no}\n";
                        $student->ticket_no = $candidate->ticket_no;
                        $student->candidate_id = $candidate->id;
                    } else {
                        echo "    No candidate record found\n";
                        $student->ticket_no = null;
                        $student->candidate_id = null;
                    }
                }
                $student_list[] = $student;
            } else {
                echo "  Student not found for ID {$student_course->student_id}\n";
            }
        }
        
        echo "\n=== RESULT ===\n";
        echo "Students to return: " . count($student_list) . "\n";
        foreach ($student_list as $student) {
            echo "  - {$student->full_name} ({$student->candidate_no})";
            if (isset($student->ticket_no)) {
                echo " - Ticket: {$student->ticket_no}";
            }
            echo "\n";
        }
    } else {
        echo "No courses found\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}