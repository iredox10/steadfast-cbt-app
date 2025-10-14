<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Student;

echo "=== Testing Student Fetch ===\n\n";

$students = Student::all();
echo "Total students: " . $students->count() . "\n\n";

if ($students->count() > 0) {
    $first = $students->first();
    echo "First student:\n";
    echo "  ID: {$first->id}\n";
    echo "  Name: {$first->full_name}\n";
    echo "  Candidate No: {$first->candidate_no}\n";
    echo "  Image: " . ($first->image ?? 'NULL') . "\n";
    echo "\n✓ Students can be fetched successfully!\n";
}
