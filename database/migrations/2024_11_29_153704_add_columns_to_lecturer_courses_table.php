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
        Schema::table('lecturer_courses', function (Blueprint $table) {
            //
            // $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // $table->foreignId('course_id')->constrained()->onDelete('cascade');
            // $table->string('title');
            // $table->string('code');
            // $table->string('credit_unit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lecturer_courses', function (Blueprint $table) {
            //
            $table->dropColumn('title');
            $table->dropColumn('code');
            $table->dropColumn('credit_unit');
        });
    }
};
