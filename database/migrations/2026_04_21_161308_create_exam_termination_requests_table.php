<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_termination_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('exam_id');
            $table->unsignedBigInteger('requested_by');
            $table->text('request_reason');
            $table->string('status')->default('pending');
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->text('review_reason')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->foreign('exam_id')->references('id')->on('exams')->onDelete('cascade');
            $table->foreign('requested_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->unsignedBigInteger('terminated_by')->nullable()->after('activated_by');
            $table->text('termination_reason')->nullable()->after('terminated_by');
            $table->foreign('terminated_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('exam_archives', function (Blueprint $table) {
            $table->text('technician_termination_reason')->nullable()->after('terminated_by_name');
            $table->text('admin_termination_reason')->nullable()->after('technician_termination_reason');
        });
    }

    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropForeign(['terminated_by']);
            $table->dropColumn(['terminated_by', 'termination_reason']);
        });

        Schema::table('exam_archives', function (Blueprint $table) {
            $table->dropColumn(['technician_termination_reason', 'admin_termination_reason']);
        });

        Schema::dropIfExists('exam_termination_requests');
    }
};
