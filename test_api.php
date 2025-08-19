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

// Simulate the API call directly
try {
    // Use course ID 1 as in our debug
    $course_id = 1;
    
    echo "Calling get_students method with course_id: {$course_id}\n";
    
    // Include the InvigilatorController
    require_once __DIR__.'/app/Http/Controllers/InvigilatorController.php';
    
    $controller = new App\Http\Controllers\InvigilatorController();
    
    // Create a mock request object
    $request = new \Illuminate\Http\Request();
    
    // Call the method directly
    $response = $controller->get_students($request, $course_id);
    
    echo "Response status: " . $response->getStatusCode() . "\n";
    echo "Response data:\n";
    
    $data = $response->getData();
    echo json_encode($data, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}