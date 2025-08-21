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
        Schema::table('questions', function (Blueprint $table) {
            // Add option_a column if it doesn't exist
            if (!Schema::hasColumn('questions', 'option_a')) {
                $table->text('option_a')->nullable();
            }
        });
        
        // Update existing records to have default values for all options
        DB::table('questions')->whereNull('option_a')->update(['option_a' => 'Default option A']);
        DB::table('questions')->whereNull('option_b')->update(['option_b' => 'Default option B']);
        DB::table('questions')->whereNull('option_c')->update(['option_c' => 'Default option C']);
        DB::table('questions')->whereNull('option_d')->update(['option_d' => 'Default option D']);
        
        // Now make all option columns non-nullable
        Schema::table('questions', function (Blueprint $table) {
            $table->text('option_a')->nullable(false)->change();
            $table->text('option_b')->nullable(false)->change();
            $table->text('option_c')->nullable(false)->change();
            $table->text('option_d')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            // Make all option columns nullable again
            $table->text('option_a')->nullable()->change();
            $table->text('option_b')->nullable()->change();
            $table->text('option_c')->nullable()->change();
            $table->text('option_d')->nullable()->change();
            
            // Drop option_a column if it was added
            if (Schema::hasColumn('questions', 'option_a')) {
                $table->dropColumn('option_a');
            }
        });
    }
};
