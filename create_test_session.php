<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\Acd_session;

// Load Laravel environment
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Creating test academic session...\n";

try {
    // Check if any sessions exist
    $existingSession = Acd_session::first();
    
    if ($existingSession) {
        echo "Academic session already exists: {$existingSession->session}\n";
        echo "You can use this for creating level admins.\n";
        exit;
    }

    // Create test academic session
    $session = Acd_session::create([
        'session' => '2024/2025',
        'status' => 'active'
    ]);

    echo "Academic session created successfully!\n";
    echo "Session: {$session->session}\n";
    echo "ID: {$session->id}\n";
    echo "Status: {$session->status}\n\n";
    echo "You can now create level admins and assign them to this session.\n";

} catch (Exception $e) {
    echo "Error creating academic session: " . $e->getMessage() . "\n";
}
