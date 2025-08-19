<?php

require_once __DIR__.'/vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;
use App\Models\User;

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

echo "Listing all users in the database:\n";
echo str_repeat("-", 50) . "\n";

try {
    $users = User::all();
    
    if ($users->isEmpty()) {
        echo "No users found in the database.\n";
    } else {
        foreach ($users as $user) {
            echo "ID: " . $user->id . "\n";
            echo "Full Name: " . $user->full_name . "\n";
            echo "Email: " . $user->email . "\n";
            echo "Role: " . $user->role . "\n";
            echo "Status: " . $user->status . "\n";
            echo str_repeat("-", 30) . "\n";
        }
    }
} catch (Exception $e) {
    echo "ERROR: Failed to retrieve users: " . $e->getMessage() . "\n";
    exit(1);
}