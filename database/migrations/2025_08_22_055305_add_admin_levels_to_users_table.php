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

        // For PostgreSQL, we need to drop and recreate the enum constraint
        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        DB::statement("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(255)");
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'level_admin', 'admin', 'regular', 'lecturer', 'invigilator'))");
        DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'regular'");
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
        
        // Revert back to original enum
        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'regular', 'lecturer', 'invigilator'))");
        DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'regular'");
    }
};
