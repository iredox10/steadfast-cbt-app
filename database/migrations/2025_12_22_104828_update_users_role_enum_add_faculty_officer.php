<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update the enum to include 'faculty_officer' and 'instructor'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'faculty_officer', 'level_admin', 'admin', 'regular', 'lecturer', 'invigilator', 'instructor') NOT NULL DEFAULT 'regular'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to previous state
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'level_admin', 'admin', 'regular', 'lecturer', 'invigilator') NOT NULL DEFAULT 'regular'");
    }
};
