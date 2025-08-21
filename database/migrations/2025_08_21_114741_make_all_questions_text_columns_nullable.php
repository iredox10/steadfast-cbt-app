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
        Schema::table('questions', function (Blueprint $table) {
            $table->text('question')->nullable()->change();
            $table->text('correct_answer')->nullable()->change();
            $table->text('option_a')->nullable()->change();
            $table->text('option_b')->nullable()->change();
            $table->text('option_c')->nullable()->change();
            $table->text('option_d')->nullable()->change();
            $table->text('file_img')->nullable()->change();
            $table->text('std_a')->nullable()->change();
            $table->text('std_b')->nullable()->change();
            $table->text('std_c')->nullable()->change();
            $table->text('std_d')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->text('question')->nullable(false)->change();
            $table->text('correct_answer')->nullable(false)->change();
            $table->text('option_a')->nullable(false)->change();
            $table->text('option_b')->nullable(false)->change();
            $table->text('option_c')->nullable(false)->change();
            $table->text('option_d')->nullable(false)->change();
            $table->text('file_img')->nullable(false)->change();
            $table->text('std_a')->nullable(false)->change();
            $table->text('std_b')->nullable(false)->change();
            $table->text('std_c')->nullable(false)->change();
            $table->text('std_d')->nullable(false)->change();
        });
    }
};
