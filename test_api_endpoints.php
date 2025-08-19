<?php

require_once __DIR__.'/vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;
use App\Http\Controllers\Admin;
use App\Http\Controllers\InvigilatorController;
use Illuminate\Http\Request;

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

echo "=== TESTING API ENDPOINTS DIRECTLY ===\n\n";

try {
    // Test 1: get_invigilator endpoint
    echo "1. Testing get_invigilator endpoint (ID: 3):\n";
    $adminController = new Admin();
    $invigilatorResponse = $adminController->get_invigilator(3);
    
    echo "Status Code: " . $invigilatorResponse->getStatusCode() . "\n";
    $invigilatorData = $invigilatorResponse->getData(true);
    echo "Response:\n" . json_encode($invigilatorData, JSON_PRETTY_PRINT) . "\n\n";
    
    // Extract course_id from the response
    $courseId = $invigilatorData['exam']['course_id'] ?? null;
    echo "Course ID from response: " . ($courseId ?? 'NOT FOUND') . "\n\n";
    
    // Test 2: get_students endpoint
    if ($courseId) {
        echo "2. Testing invigilator students endpoint (Course ID: {$courseId}):\n";
        $invigilatorController = new InvigilatorController();
        $request = new Request();
        $studentsResponse = $invigilatorController->get_students($request, $courseId);
        
        echo "Status Code: " . $studentsResponse->getStatusCode() . "\n";
        $studentsData = $studentsResponse->getData(true);
        echo "Number of students returned: " . count($studentsData) . "\n";
        echo "Sample student data:\n" . json_encode(array_slice($studentsData, 0, 2), JSON_PRETTY_PRINT) . "\n\n";
    } else {
        echo "2. Skipping students endpoint test - no course ID found\n\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}