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
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'name') && !Schema::hasColumn('users', 'full_name')) {
                $table->renameColumn('name', 'full_name');
            } elseif (!Schema::hasColumn('users', 'full_name')) {
                $table->string('full_name')->after('id')->nullable();
            }

            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['super_admin', 'level_admin', 'admin', 'regular', 'lecturer', 'invigilator'])->default('regular')->after('full_name');
            }

            if (!Schema::hasColumn('users', 'status')) {
                $table->enum('status', ['active', 'not_active'])->default('not_active')->after('role');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
