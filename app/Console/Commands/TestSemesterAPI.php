<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\Admin;
use App\Models\User;
use Illuminate\Http\Request;

class TestSemesterAPI extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:semester-api {user_id} {session_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the semester API for a specific user and session';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('user_id');
        $sessionId = $this->argument('session_id');
        
        $this->info("Testing semester API for user {$userId} and session {$sessionId}");
        
        // Get the user
        $user = User::find($userId);
        if (!$user) {
            $this->error("User not found!");
            return;
        }
        
        $this->info("User: {$user->name} (Role: {$user->role})");
        
        // Create a mock request
        $request = new Request();
        $request->setUserResolver(function () use ($user) {
            return $user;
        });
        
        // Create controller instance
        $controller = new Admin();
        
        // Call the method directly
        $response = $controller->getSessionSemesters($sessionId);
        
        $this->info("Response status: " . $response->getStatusCode());
        $this->info("Response data: " . $response->getContent());
    }
}
