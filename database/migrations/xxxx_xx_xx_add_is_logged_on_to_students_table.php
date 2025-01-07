<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('is_logged_on')->default('no');
            $table->timestamp('checkin_time')->nullable();
            // $table->timestamp('checkout_time')->nullable();
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('is_logged_on');
            $table->dropColumn('checkin_time');
            $table->dropColumn('checkout_time');
        });
    }
}; 