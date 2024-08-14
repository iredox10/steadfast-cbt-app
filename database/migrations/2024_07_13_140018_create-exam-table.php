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
        Schema::create('exam', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->constrained()->onDelete('cascade');
            $table->enum('exam_type',['school','external'])->default('school');
            $table->text('instructions')->nullable();
            $table->tinyInteger('max_score');
            $table->decimal('marks_per_question');
            $table->tinyInteger('no_of_questions');
            $table->tinyInteger('actual_questions');
            $table->tinyInteger('exam_duration');
            $table->string('invigilator')->nullable();
            $table->enum('submission_status',['submitted','not_submitted'])->default('not_submitted');
            $table->timestamp('submission_date')->nullable();
            $table->timestamp('activated_date')->nullable();
            $table->timestamp('start_time')->nullable();
            $table->timestamp('finished_time')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam');
    }
};
