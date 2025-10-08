<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

echo "=== All Users in System ===\n\n";

$users = User::all();
echo "Total Users: " . $users->count() . "\n\n";

foreach ($users as $user) {
    echo "ID: {$user->id}\n";
    echo "Name: {$user->full_name}\n";
    echo "Email: {$user->email}\n";
    echo "Role: {$user->role}\n";
    echo "---\n";
}
