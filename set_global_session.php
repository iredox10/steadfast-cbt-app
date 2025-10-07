<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\Acd_session;
use App\Models\SystemConfig;

// Load Laravel environment
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Set Global Active Session ===\n\n";

try {
    // Get all available sessions/departments
    $sessions = Acd_session::orderBy('title')->get();
    
    if ($sessions->isEmpty()) {
        echo "No sessions/departments found. Please create some first using create_departments.php\n";
        exit(1);
    }
    
    echo "Available Sessions/Departments:\n";
    echo "================================\n";
    foreach ($sessions as $index => $session) {
        $status = $session->status === 'active' ? '✓ Active' : '○ Inactive';
        echo ($index + 1) . ". {$session->title} [{$status}]\n";
    }
    
    // Check current global session
    $currentGlobal = SystemConfig::getGlobalActiveSession();
    if ($currentGlobal) {
        echo "\nCurrent global active session: {$currentGlobal->title}\n";
    } else {
        echo "\nNo global active session is currently set.\n";
    }
    
    echo "\nEnter the number of the session to set as global active (or 0 to cancel): ";
    $handle = fopen("php://stdin", "r");
    $line = trim(fgets($handle));
    fclose($handle);
    
    $choice = intval($line);
    
    if ($choice === 0) {
        echo "Operation cancelled.\n";
        exit(0);
    }
    
    if ($choice < 1 || $choice > $sessions->count()) {
        echo "Invalid choice. Please run the script again.\n";
        exit(1);
    }
    
    $selectedSession = $sessions[$choice - 1];
    
    // Set the global active session
    SystemConfig::setGlobalActiveSession($selectedSession->id);
    
    // Also make sure the session itself is active
    if ($selectedSession->status !== 'active') {
        $selectedSession->status = 'active';
        $selectedSession->save();
        echo "✓ Session status updated to active\n";
    }
    
    echo "\n✅ SUCCESS!\n";
    echo "Global active session set to: {$selectedSession->title}\n";
    echo "\nLevel admins can now access this session.\n";
    echo "All courses should be added to this session.\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
