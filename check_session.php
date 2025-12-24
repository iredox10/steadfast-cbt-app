<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Models\SystemConfig;
use App\Models\Acd_session;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$sessionId = SystemConfig::get('global_active_session_id');
echo "Global Active Session ID from Config: " . ($sessionId ?? 'NULL') . PHP_EOL;

$session = SystemConfig::getGlobalActiveSession();
if ($session) {
    echo "Session Found: " . $session->title . " (ID: " . $session->id . ", Status: " . $session->status . ")" . PHP_EOL;
} else {
    echo "Session NOT Found in database for ID: " . $sessionId . PHP_EOL;
}

$allActiveSessions = Acd_session::where('status', 'active')->where('title', 'LIKE', '%/%')->get();
echo "All Active Academic Sessions in database: " . $allActiveSessions->count() . PHP_EOL;
foreach ($allActiveSessions as $s) {
    echo " - " . $s->title . " (ID: " . $s->id . ")" . PHP_EOL;
}
