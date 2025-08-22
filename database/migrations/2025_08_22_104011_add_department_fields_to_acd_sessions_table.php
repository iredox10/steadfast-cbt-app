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
        Schema::table('acd_sessions', function (Blueprint $table) {
            $table->text('description')->nullable()->after('title');
            $table->string('department_code', 10)->unique()->nullable()->after('description');
            $table->boolean('status')->default(true)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('acd_sessions', function (Blueprint $table) {
            $table->dropColumn(['description', 'department_code']);
            $table->string('status')->change();
        });
    }
};
