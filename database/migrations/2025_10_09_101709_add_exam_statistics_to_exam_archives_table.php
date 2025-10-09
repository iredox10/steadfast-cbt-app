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
        Schema::table('exam_archives', function (Blueprint $table) {
            $table->integer('total_questions')->nullable()->after('duration');
            $table->integer('marks_per_question')->nullable()->after('total_questions');
            $table->integer('total_marks')->nullable()->after('marks_per_question');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_archives', function (Blueprint $table) {
            $table->dropColumn(['total_questions', 'marks_per_question', 'total_marks']);
        });
    }
};
