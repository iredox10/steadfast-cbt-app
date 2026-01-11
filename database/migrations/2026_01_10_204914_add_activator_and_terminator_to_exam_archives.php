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
        Schema::table('exams', function (Blueprint $table) {
            $table->unsignedBigInteger('activated_by')->nullable()->after('activated_date');
            $table->foreign('activated_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('exam_archives', function (Blueprint $table) {
            $table->string('activated_by_name')->nullable()->after('total_marks');
            $table->string('terminated_by_name')->nullable()->after('activated_by_name');
        });
    }

    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropForeign(['activated_by']);
            $table->dropColumn('activated_by');
        });

        Schema::table('exam_archives', function (Blueprint $table) {
            $table->dropColumn(['activated_by_name', 'terminated_by_name']);
        });
    }
};
