<?php

require_once __DIR__.'/vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;
use App\Models\Student;
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

echo "=== DEBUGGING STUDENT AND CANDIDATE DATA ===\n\n";

try {
    // Get a sample student
    $student = Student::first();
    if ($student) {
        echo "Student:\n";
        echo "  ID: {$student->id}\n";
        echo "  Candidate No: {$student->candidate_no}\n";
        echo "  Full Name: {$student->full_name}\n";
        echo "  Checkin Time: " . ($student->checkin_time ?? 'NULL') . "\n";
        echo "  Is Logged On: {$student->is_logged_on}\n";
        
        // Get candidate records for this student
        $candidates = Candidate::where('student_id', $student->id)->get();
        echo "\nCandidates for this student:\n";
        foreach ($candidates as $candidate) {
            echo "  Candidate ID: {$candidate->id}\n";
            echo "  Ticket No: {$candidate->ticket_no}\n";
            echo "  Exam ID: {$candidate->exam_id}\n";
            echo "  Checkin Time: {$candidate->checkin_time}\n";
            echo "  Is Logged On: {$candidate->is_logged_on}\n";
            echo "  ---\n";
        }
    } else {
        echo "No students found\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}