<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->enum('timer_start_type', ['manual', 'scheduled'])->default('manual')->after('timer_mode');
            $table->timestamp('scheduled_start_time')->nullable()->after('timer_start_type');
        });
    }

    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn(['timer_start_type', 'scheduled_start_time']);
        });
    }
};
