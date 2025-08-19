<?php

require_once __DIR__.'/vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;

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

// Test relationships
try {
    echo "=== TESTING RELATIONSHIPS ===\n";
    
    // Test Course -> StudentCourse relationship
    $course = \App\Models\Course::first();
    if ($course) {
        echo "Course: {$course->title}\n";
        echo "Student course count: " . $course->studentCourses()->count() . "\n";
        
        foreach ($course->studentCourses as $sc) {
            echo "  Student Course ID: {$sc->id}\n";
            echo "  Student ID: {$sc->student_id}\n";
            echo "  Course ID: {$sc->course_id}\n";
            
            // Test StudentCourse -> Student relationship
            if ($sc->student) {
                echo "  Student: {$sc->student->full_name}\n";
            } else {
                echo "  Student: NOT FOUND\n";
            }
        }
    } else {
        echo "No courses found\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}