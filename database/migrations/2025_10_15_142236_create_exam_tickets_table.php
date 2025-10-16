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
        Schema::create('exam_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
            $table->string('ticket_no', 10)->unique();
            $table->boolean('is_used')->default(false);
            $table->foreignId('assigned_to_student_id')->nullable()->constrained('students')->onDelete('set null');
            $table->timestamp('assigned_at')->nullable();
            $table->timestamps();

            // Index for faster lookups
            $table->index(['exam_id', 'is_used']);
            $table->index('ticket_no');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_tickets');
    }
};
