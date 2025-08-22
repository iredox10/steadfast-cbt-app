<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Load Laravel environment
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Creating Super Admin User...\n";

try {
    // Check if super admin already exists
    $existingSuperAdmin = User::where('role', 'super_admin')->first();
    
    if ($existingSuperAdmin) {
        echo "Super Admin already exists: {$existingSuperAdmin->email}\n";
        echo "You can use this account to create level admins.\n";
        exit;
    }

    // Create super admin
    $superAdmin = User::create([
        'full_name' => 'Super Administrator',
        'email' => 'superadmin@cbt.com',
        'password' => Hash::make('superadmin123'),
        'role' => 'super_admin',
        'status' => 'active',
        'level_id' => null // Super admin has access to all levels
    ]);

    echo "Super Admin created successfully!\n";
    echo "Email: superadmin@cbt.com\n";
    echo "Password: superadmin123\n";
    echo "Role: super_admin\n\n";
    echo "You can now login and create level admins through the admin interface.\n";

} catch (Exception $e) {
    echo "Error creating super admin: " . $e->getMessage() . "\n";
}
