<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = 'superadmin@steadfast.com';
        
        // Check if user exists to avoid duplicates if run multiple times
        if (!User::where('email', $email)->exists()) {
            User::create([
                'full_name' => 'Super Administrator',
                'email' => $email,
                'password' => Hash::make('admin123'),
                'role' => 'super_admin',
                'status' => 'active',
            ]);
            $this->command->info('Super Admin created successfully.');
        } else {
            $this->command->info('Super Admin already exists.');
        }
    }
}
