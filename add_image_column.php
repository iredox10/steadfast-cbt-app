<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Adding 'image' Column to Students Table ===\n\n";

try {
    // Add the image column after password
    DB::statement("ALTER TABLE students ADD COLUMN image VARCHAR(255) NULL AFTER password");
    echo "✓ Successfully added 'image' column to students table\n";
    
    // Verify
    $columns = \Illuminate\Support\Facades\Schema::getColumnListing('students');
    if (in_array('image', $columns)) {
        echo "✓ Verified: 'image' column now exists\n";
    } else {
        echo "✗ Warning: Column might not have been added correctly\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    
    // Check if column already exists
    $columns = \Illuminate\Support\Facades\Schema::getColumnListing('students');
    if (in_array('image', $columns)) {
        echo "Note: 'image' column already exists\n";
    }
}
