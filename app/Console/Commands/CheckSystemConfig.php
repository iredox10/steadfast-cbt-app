<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SystemConfig;
use App\Models\Acd_session;

class CheckSystemConfig extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:system-config';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check system configuration table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking SystemConfig table...');
        
        $configs = SystemConfig::all();
        $this->info('Records found: ' . $configs->count());
        
        foreach($configs as $config) {
            $this->info("Key: {$config->key}, Value: {$config->value}");
        }
        
        $this->info('');
        $this->info('Checking active sessions...');
        
        $activeSessions = Acd_session::where('status', 'active')->get();
        $this->info('Active sessions found: ' . $activeSessions->count());
        
        foreach($activeSessions as $session) {
            $this->info("Session ID: {$session->id}, Session: {$session->session}, Status: {$session->status}");
        }
        
        $this->info('');
        $this->info('Checking global active session...');
        
        $globalActiveSession = SystemConfig::getGlobalActiveSession();
        if($globalActiveSession) {
            $this->info("Global active session: {$globalActiveSession->session} (ID: {$globalActiveSession->id})");
        } else {
            $this->error('No global active session set!');
        }
    }
}
