<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('exam_archives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams');
            $table->string('exam_title');
            $table->string('course_title');
            $table->dateTime('exam_date');
            $table->integer('duration');
            $table->json('student_results'); // Will store array of student results
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('exam_archives');
    }
}; 