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
        Schema::table('users', function (Blueprint $table) {
            // Add level_id to associate users with academic sessions/levels
            $table->unsignedBigInteger('level_id')->nullable()->after('role');
            $table->foreign('level_id')->references('id')->on('acd_sessions')->onDelete('set null');
        });

        // For MySQL/MariaDB, modify the enum to include new roles
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'level_admin', 'admin', 'regular', 'lecturer', 'invigilator') NOT NULL DEFAULT 'regular'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['level_id']);
            $table->dropColumn('level_id');
        });
        
        // Revert back to original enum for MySQL/MariaDB
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'regular', 'lecturer', 'invigilator') NOT NULL DEFAULT 'regular'");
    }
};
