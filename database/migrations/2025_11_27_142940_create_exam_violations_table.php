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
        Schema::create('exam_violations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('exam_id')->constrained()->onDelete('cascade');
            $table->enum('violation_type', [
                'tab_switch',
                'fullscreen_exit',
                'copy_attempt',
                'paste_attempt',
                'screenshot_attempt',
                'right_click',
                'devtools_attempt',
                'multiple_monitors_detected'
            ]);
            $table->text('details')->nullable(); // JSON details about the violation
            $table->timestamp('violated_at');
            $table->timestamps();
            
            // Add index for faster queries
            $table->index(['student_id', 'exam_id']);
            $table->index('violation_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_violations');
    }
};
