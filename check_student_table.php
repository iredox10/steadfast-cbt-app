<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "=== Checking Students Table Structure ===\n\n";

try {
    // Check if students table exists
    if (Schema::hasTable('students')) {
        echo "✓ Students table exists\n\n";
        
        // Get all columns
        $columns = Schema::getColumnListing('students');
        echo "Columns in students table:\n";
        foreach ($columns as $column) {
            echo "  - $column\n";
        }
        
        // Check if image column exists
        echo "\n";
        if (in_array('image', $columns)) {
            echo "✓ 'image' column exists\n";
        } else {
            echo "✗ 'image' column DOES NOT exist - migration needs to be run\n";
        }
        
        // Count students
        $count = DB::table('students')->count();
        echo "\nTotal students in database: $count\n";
        
    } else {
        echo "✗ Students table does not exist\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
