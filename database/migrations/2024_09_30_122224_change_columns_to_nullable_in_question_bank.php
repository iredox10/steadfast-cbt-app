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
        // Check if the table exists before trying to modify it
        if (Schema::hasTable('question_banks')) {
            Schema::table('question_banks', function (Blueprint $table) {
                // Only modify columns that exist in the table
                if (Schema::hasColumn('question_banks', 'option_c')) {
                    $table->string('option_c')->nullable()->change();
                }
                if (Schema::hasColumn('question_banks', 'option_d')) {
                    $table->string('option_d')->nullable()->change();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Check if the table exists before trying to modify it
        if (Schema::hasTable('question_banks')) {
            Schema::table('question_banks', function (Blueprint $table) {
                // Only modify columns that exist in the table
                if (Schema::hasColumn('question_banks', 'option_c')) {
                    $table->string('option_c')->nullable(false)->change();
                }
                if (Schema::hasColumn('question_banks', 'option_d')) {
                    $table->string('option_d')->nullable(false)->change();
                }
            });
        }
    }
};
