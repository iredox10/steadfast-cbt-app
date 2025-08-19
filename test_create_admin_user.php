<?php

require_once 'vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
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
    'driver'    => 'mysql',
    'host'      => $_ENV['DB_HOST'] ?? '127.0.0.1',
    'database'  => $_ENV['DB_DATABASE'] ?? 'steadfast',
    'username'  => $_ENV['DB_USERNAME'] ?? 'root',
    'password' => $_ENV['DB_PASSWORD'] ?? '',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

// Create an admin user via the API approach
echo "Testing admin user creation via API...\n";

// Validate input
$fullName = 'Test Admin';
$email = 'testadmin@example.com';
$password = 'password123';

// Create the admin user
try {
    $user = new User();
    $user->full_name = $fullName;
    $user->email = $email;
    $user->password = password_hash($password, PASSWORD_DEFAULT);
    $user->role = 'admin';
    $user->status = 'active';
    $user->save();

    echo "Created admin user with email: $email\n";
    echo "Password: $password\n";
    echo "Role: admin\n";
} catch (Exception $e) {
    echo "Error creating admin user: " . $e->getMessage() . "\n";
}