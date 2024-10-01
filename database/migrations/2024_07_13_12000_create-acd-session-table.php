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
        Schema::create('acd_sessions', function (Blueprint $table) {
            $table->id();  // This will create a primary key named 'id'
            $table->string('title')->unique();
            $table->enum('status', ['inactive', 'active'])->default('active');
            $table->timestamps();  // This will create 'created_at' and 'updated_at' columns
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('acd_session');
    }
};
