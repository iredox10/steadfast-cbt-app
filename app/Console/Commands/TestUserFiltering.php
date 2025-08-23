<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Semester;
use App\Models\Course;
use App\Models\SystemConfig;

class TestUserFiltering extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:user-filtering';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test user filtering for level admins';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing user filtering system...');
        
        // Get global active session
        $activeSession = SystemConfig::getGlobalActiveSession();
        if (!$activeSession) {
            $this->error('No global active session set!');
            return;
        }
        
        $this->info("Active session: {$activeSession->session} (ID: {$activeSession->id})");
        
        // Get all level admins
        $levelAdmins = User::where('role', 'level_admin')->get();
        $this->info("Found {$levelAdmins->count()} level admin(s)");
        
        foreach ($levelAdmins as $admin) {
            $this->info("");
            $this->info("Level Admin: {$admin->name} (ID: {$admin->id})");
            
            // Get semesters created by this admin
            $semesters = Semester::where('acd_session_id', $activeSession->id)
                               ->where('created_by', $admin->id)
                               ->get();
            $this->info("  - Semesters created: {$semesters->count()}");
            
            foreach ($semesters as $semester) {
                $this->info("    * {$semester->semester}");
            }
            
            // Get courses created by this admin
            $courses = Course::where('created_by', $admin->id)
                           ->whereHas('semester', function($query) use ($activeSession) {
                               $query->where('acd_session_id', $activeSession->id);
                           })
                           ->get();
            $this->info("  - Courses created: {$courses->count()}");
            
            foreach ($courses as $course) {
                $this->info("    * {$course->code}: {$course->title}");
            }
        }
        
        $this->info("");
        $this->info('User filtering test completed!');
    }
}
