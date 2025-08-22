<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use App\Models\Acd_session;
use Illuminate\Support\Facades\Hash;

// Load Laravel environment
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Creating Level Admin User...\n";

try {
    // Show available academic sessions
    $sessions = Acd_session::all();
    
    if ($sessions->isEmpty()) {
        echo "No academic sessions found. Please create academic sessions first.\n";
        exit;
    }

    echo "Available Academic Sessions:\n";
    foreach ($sessions as $session) {
        echo "ID: {$session->id} - {$session->title}\n";
    }

    // Get user input for level admin details
    echo "\nEnter Level Admin Details:\n";
    echo "Full Name: ";
    $fullName = trim(fgets(STDIN));
    
    echo "Email: ";
    $email = trim(fgets(STDIN));
    
    echo "Password: ";
    $password = trim(fgets(STDIN));
    
    echo "Academic Session ID (from list above): ";
    $levelId = trim(fgets(STDIN));

    // Validate academic session exists
    $session = Acd_session::find($levelId);
    if (!$session) {
        echo "Invalid academic session ID.\n";
        exit;
    }

    // Check if user already exists
    $existingUser = User::where('email', $email)->first();
    if ($existingUser) {
        echo "User with this email already exists.\n";
        exit;
    }

    // Create level admin
    $levelAdmin = User::create([
        'full_name' => $fullName,
        'email' => $email,
        'password' => Hash::make($password),
        'role' => 'level_admin',
        'status' => 'active',
        'level_id' => $levelId
    ]);

    echo "\nLevel Admin created successfully!\n";
    echo "Email: {$email}\n";
    echo "Password: {$password}\n";
    echo "Role: level_admin\n";
    echo "Assigned Level: {$session->title}\n";
    echo "\nThis admin can now manage students, instructors, and exams within their assigned level.\n";

} catch (Exception $e) {
    echo "Error creating level admin: " . $e->getMessage() . "\n";
}
