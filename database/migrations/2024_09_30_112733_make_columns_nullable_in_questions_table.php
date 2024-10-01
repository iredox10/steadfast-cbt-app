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
            //
            $table->string('file_img')->nullable()->change();
            $table->string('std_a')->nullable()->change();
            $table->string('std_b')->nullable()->change();
            $table->string('std_c')->nullable()->change();
            $table->string('std_d')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            //
            $table->string('file_img')->nullable(false)->change();
            $table->string('std_a')->nullable(false)->change();
            $table->string('std_b')->nullable(false)->change();
            $table->string('std_c')->nullable(false)->change();
            $table->string('std_d')->nullable(false)->change();
        });
    }
};
