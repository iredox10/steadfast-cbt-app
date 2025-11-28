<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SuperAdminSeeder::class,
        ]);

        // Create admin user
        User::create([
            'full_name' => 'Administrator',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        // Create sample invigilator
        User::create([
            'full_name' => 'Test Invigilator',
            'email' => 'invigilator@example.com',
            'password' => bcrypt('password'),
            'role' => 'invigilator',
            'status' => 'active',
        ]);

        // Create sample lecturer
        User::create([
            'full_name' => 'Test Lecturer',
            'email' => 'lecturer@example.com',
            'password' => bcrypt('password'),
            'role' => 'lecturer',
            'status' => 'active',
        ]);
    }
}
