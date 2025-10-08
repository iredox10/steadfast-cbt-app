<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\Exam;
use App\Models\User;

// Load Laravel environment
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Assign Invigilator to Active Exam ===\n\n";

try {
    // Get active exam
    $exam = Exam::where('activated', 'yes')->first();
    
    if (!$exam) {
        echo "No active exam found.\n";
        exit(1);
    }
    
    echo "Active exam found:\n";
    echo "  - Exam ID: {$exam->id}\n";
    echo "  - Course ID: {$exam->course_id}\n";
    echo "  - Current invigilator ID: " . ($exam->invigilator_id ?? 'NULL') . "\n\n";
    
    // Get invigilator
    $invigilator = User::where('role', 'invigilator')->first();
    
    if (!$invigilator) {
        echo "No invigilator found in the system.\n";
        exit(1);
    }
    
    echo "Found invigilator: {$invigilator->full_name} (ID: {$invigilator->id})\n\n";
    
    // Assign invigilator to exam (using the string invigilator field)
    $exam->invigilator = $invigilator->full_name;
    $exam->save();
    
    echo "✅ SUCCESS!\n";
    echo "Invigilator '{$invigilator->full_name}' has been assigned to the exam.\n";
    echo "\nNOTE: The invigilator should be able to see students if:\n";
    echo "  1. They are logged in with user ID: {$invigilator->id}\n";
    echo "  2. Students are enrolled in the course\n";
    echo "  3. Students have matching level_id with the exam\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
