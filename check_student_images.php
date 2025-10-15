<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Student;

echo "Checking student images:\n";
echo "=========================\n\n";

$students = Student::take(10)->get();

foreach ($students as $student) {
    echo "ID: {$student->id}\n";
    echo "Name: {$student->full_name}\n";
    echo "Image: " . ($student->image ?? 'NULL') . "\n";
    echo "---\n";
}

echo "\nTotal students: " . Student::count() . "\n";
echo "Students with images: " . Student::whereNotNull('image')->count() . "\n";
