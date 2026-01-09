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
        $email = 'superadmin@buk.com';
        $password = 'password';

        $user = User::where('email', $email)->first();

        if ($user) {
            $user->update([
                'full_name' => 'Super Administrator',
                'password' => Hash::make($password),
                'role' => 'super_admin',
                'status' => 'active',
            ]);
            $this->command->info('Super Admin updated successfully.');
        } else {
            User::create([
                'full_name' => 'Super Administrator',
                'email' => $email,
                'password' => Hash::make($password),
                'role' => 'super_admin',
                'status' => 'active',
            ]);
            $this->command->info('Super Admin created successfully.');
        }
    }
}
