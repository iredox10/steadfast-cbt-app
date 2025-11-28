<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateSuperAdmin extends Command
{
    protected $signature = 'admin:create-super';
    protected $description = 'Create a super admin user';

    public function handle()
    {
        $email = 'superadmin@steadfast.com';
        $password = 'admin123';

        // Check if user exists
        $user = User::where('email', $email)->first();

        if ($user) {
            $this->info('User already exists. Updating to super_admin...');
            $user->role = 'super_admin';
            $user->status = 'active';
            $user->password = Hash::make($password);
            $user->save();
        } else {
            $this->info('Creating new super admin...');
            $user = User::create([
                'full_name' => 'Super Administrator',
                'email' => $email,
                'password' => Hash::make($password),
                'role' => 'super_admin',
                'status' => 'active'
            ]);
        }

        $this->info('✅ Super Admin created/updated successfully!');
        $this->info('');
        $this->info('Login Credentials:');
        $this->info('Email: ' . $email);
        $this->info('Password: ' . $password);
        $this->info('');

        return 0;
    }
}
