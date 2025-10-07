<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\Acd_session;
use App\Models\SystemConfig;

// Load Laravel environment
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Quick Set Global Active Session ===\n\n";

try {
    // Get the first active session
    $session = Acd_session::where('status', 'active')->first();
    
    if (!$session) {
        // If no active session, get any session and activate it
        $session = Acd_session::first();
        if (!$session) {
            echo "No sessions found. Please create some first using create_departments.php\n";
            exit(1);
        }
        $session->status = 'active';
        $session->save();
    }
    
    // Check current global session
    $currentGlobal = SystemConfig::getGlobalActiveSession();
    if ($currentGlobal) {
        echo "Current global active session: {$currentGlobal->title}\n";
        echo "Updating to: {$session->title}\n\n";
    } else {
        echo "No global session currently set.\n";
        echo "Setting global session to: {$session->title}\n\n";
    }
    
    // Set the global active session
    SystemConfig::setGlobalActiveSession($session->id);
    
    echo "✅ SUCCESS!\n";
    echo "Global active session: {$session->title}\n";
    echo "\nLevel admins can now access this session.\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
