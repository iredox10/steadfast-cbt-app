<?php

require_once __DIR__.'/vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;
use App\Models\User;
use App\Models\Exam;

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

// Test what the get_invigilator endpoint returns
try {
    echo "=== TESTING GET INVIGILATOR ENDPOINT ===\n";
    
    // Find a user with role 'regular' (which seems to be used for invigilators)
    $user = User::where('role', 'regular')->first();
    if (!$user) {
        echo "No regular user found\n";
        exit(1);
    }
    
    echo "User: {$user->full_name} ({$user->email})\n";
    
    // Check if this user is assigned to any active exam
    $exam = Exam::where('activated', 'yes')->first();
    if ($exam) {
        echo "Active exam found: ID {$exam->id}\n";
        echo "Exam course ID: {$exam->course_id}\n";
        echo "Exam invigilator: {$exam->invigilator}\n";
        
        // Check if this user is the invigilator
        $examAssigned = ($user->email === $exam->invigilator);
        echo "User is assigned as invigilator: " . ($examAssigned ? "Yes" : "No") . "\n";
        
        // Simulate the response structure
        $response = [
            'Invigilator' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role
            ],
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'course_id' => $exam->course_id,
                'activated' => $exam->activated
            ],
            'examAssigned' => $examAssigned
        ];
        
        echo "\n=== SIMULATED RESPONSE ===\n";
        echo json_encode($response, JSON_PRETTY_PRINT);
    } else {
        echo "No active exam found\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}