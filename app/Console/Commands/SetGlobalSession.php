<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SystemConfig;
use App\Models\Acd_session;

class SetGlobalSession extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'set:global-session {session_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set the global active session';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $sessionId = $this->argument('session_id');
        
        if (!$sessionId) {
            // Find the first active session
            $activeSession = Acd_session::where('status', 'active')->first();
            if ($activeSession) {
                $sessionId = $activeSession->id;
                $this->info("Found active session: {$activeSession->session} (ID: {$sessionId})");
            } else {
                $this->error('No active session found!');
                return;
            }
        }
        
        // Verify the session exists and is active
        $session = Acd_session::where('id', $sessionId)->where('status', 'active')->first();
        if (!$session) {
            $this->error("Session ID {$sessionId} not found or not active!");
            return;
        }
        
        // Set as global active session
        SystemConfig::setGlobalActiveSession($sessionId);
        $this->info("Global active session set to: {$session->session} (ID: {$sessionId})");
        
        // Verify
        $globalSession = SystemConfig::getGlobalActiveSession();
        if ($globalSession) {
            $this->info("Verification: Global active session is now: {$globalSession->session}");
        } else {
            $this->error('Failed to set global active session!');
        }
    }
}
