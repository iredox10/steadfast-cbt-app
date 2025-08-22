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
        Schema::table('acd_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('acd_sessions', 'head_of_department')) {
                $table->string('head_of_department')->nullable();
            }
            if (!Schema::hasColumn('acd_sessions', 'contact_email')) {
                $table->string('contact_email')->nullable();
            }
            if (!Schema::hasColumn('acd_sessions', 'contact_phone')) {
                $table->string('contact_phone')->nullable();
            }
            if (!Schema::hasColumn('acd_sessions', 'description')) {
                $table->text('description')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('acd_sessions', function (Blueprint $table) {
            $table->dropColumn(['head_of_department', 'contact_email', 'contact_phone', 'description']);
        });
    }
};
