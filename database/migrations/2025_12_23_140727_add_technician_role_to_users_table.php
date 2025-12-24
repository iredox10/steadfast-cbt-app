<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For MySQL/MariaDB, modify the enum to include 'technician'
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'faculty_officer', 'level_admin', 'admin', 'regular', 'lecturer', 'invigilator', 'instructor', 'technician') NOT NULL DEFAULT 'regular'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back by removing 'technician'
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'faculty_officer', 'level_admin', 'admin', 'regular', 'lecturer', 'invigilator', 'instructor') NOT NULL DEFAULT 'regular'");
    }
};
