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
        Schema::table('exams', function (Blueprint $table) {
            // Browser lockdown security settings
            $table->boolean('enable_browser_lockdown')->default(true);
            $table->boolean('enable_fullscreen')->default(true);
            $table->boolean('enable_copy_paste_block')->default(true);
            $table->boolean('enable_screenshot_block')->default(true);
            $table->boolean('enable_tab_switch_detection')->default(true);
            $table->boolean('enable_multiple_monitor_check')->default(true);
            $table->integer('max_violations')->default(3);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn([
                'enable_browser_lockdown',
                'enable_fullscreen',
                'enable_copy_paste_block',
                'enable_screenshot_block',
                'enable_tab_switch_detection',
                'enable_multiple_monitor_check',
                'max_violations'
            ]);
        });
    }
};
