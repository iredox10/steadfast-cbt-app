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

echo "Checking existing users...\n";

try {
    $users = User::all();
    
    if ($users->isEmpty()) {
        echo "No users found. Creating admin user...\n";
        
        // Create admin user
        $admin = new User();
        $admin->full_name = 'Administrator';
        $admin->email = 'admin@example.com';
        $admin->password = password_hash('password', PASSWORD_DEFAULT);
        $admin->role = 'admin';
        $admin->status = 'active';
        $admin->save();
        
        echo "SUCCESS: Admin user created!\n";
        echo "Email: admin@example.com\n";
        echo "Password: password\n";
        
        // Create sample invigilator
        $invigilator = new User();
        $invigilator->full_name = 'Test Invigilator';
        $invigilator->email = 'invigilator@example.com';
        $invigilator->password = password_hash('password', PASSWORD_DEFAULT);
        $invigilator->role = 'invigilator';
        $invigilator->status = 'active';
        $invigilator->save();
        
        echo "SUCCESS: Sample invigilator created!\n";
        echo "Email: invigilator@example.com\n";
        echo "Password: password\n";
        
        // Create sample lecturer
        $lecturer = new User();
        $lecturer->full_name = 'Test Lecturer';
        $lecturer->email = 'lecturer@example.com';
        $lecturer->password = password_hash('password', PASSWORD_DEFAULT);
        $lecturer->role = 'lecturer';
        $lecturer->status = 'active';
        $lecturer->save();
        
        echo "SUCCESS: Sample lecturer created!\n";
        echo "Email: lecturer@example.com\n";
        echo "Password: password\n";
    } else {
        echo "Existing users found:\n";
        foreach ($users as $user) {
            echo "- {$user->full_name} ({$user->email}) - Role: {$user->role}\n";
        }
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}