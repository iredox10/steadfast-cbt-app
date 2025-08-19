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

echo "Creating new admin user...\n";

// Create the admin user
try {
    $user = new User();
    $user->full_name = 'Administrator';
    $user->email = 'admin@example.com';
    $user->password = password_hash('password', PASSWORD_DEFAULT);
    $user->role = 'admin';
    $user->status = 'active';
    $user->save();

    echo "SUCCESS: Admin user created!\n";
    echo "Email: admin@example.com\n";
    echo "Password: password\n";
    echo "Please change the password after first login.\n";
} catch (Exception $e) {
    echo "ERROR: Failed to create admin user: " . $e->getMessage() . "\n";
    exit(1);
}