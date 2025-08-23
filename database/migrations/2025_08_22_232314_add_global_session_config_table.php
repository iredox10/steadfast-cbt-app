<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('system_config', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, integer, boolean, json
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Insert default global session configuration
        DB::table('system_config')->insert([
            [
                'key' => 'global_active_session_id',
                'value' => null,
                'type' => 'integer',
                'description' => 'The currently active academic session for the entire system',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'allow_multiple_sessions',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Whether to allow multiple active sessions simultaneously',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_config');
    }
};
