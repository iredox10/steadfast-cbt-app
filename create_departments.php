<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\Acd_session;

// Load Laravel environment
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Creating sample departments...\n\n";

$departments = [
    [
        'title' => 'Computer Science',
        'head_of_department' => 'Dr. John Doe',
        'contact_email' => 'cs@hukpoly.edu.ng',
        'contact_phone' => '+234-XXX-XXX-XXXX',
        'description' => 'Department of Computer Science',
        'status' => 'active'
    ],
    [
        'title' => 'Electrical Engineering',
        'head_of_department' => 'Dr. Jane Smith',
        'contact_email' => 'ee@hukpoly.edu.ng',
        'contact_phone' => '+234-XXX-XXX-XXXX',
        'description' => 'Department of Electrical Engineering',
        'status' => 'active'
    ],
    [
        'title' => 'Business Administration',
        'head_of_department' => 'Prof. Ahmed Musa',
        'contact_email' => 'ba@hukpoly.edu.ng',
        'contact_phone' => '+234-XXX-XXX-XXXX',
        'description' => 'Department of Business Administration',
        'status' => 'active'
    ],
    [
        'title' => 'Mechanical Engineering',
        'head_of_department' => 'Engr. Mohammed Ali',
        'contact_email' => 'me@hukpoly.edu.ng',
        'contact_phone' => '+234-XXX-XXX-XXXX',
        'description' => 'Department of Mechanical Engineering',
        'status' => 'active'
    ]
];

try {
    foreach ($departments as $dept) {
        // Check if department already exists
        $existing = Acd_session::where('title', $dept['title'])->first();
        
        if ($existing) {
            echo "Department already exists: {$dept['title']}\n";
            continue;
        }
        
        $department = Acd_session::create($dept);
        echo "✓ Created: {$department->title}\n";
    }
    
    echo "\n✅ Departments setup complete!\n";
    echo "\nYou can now create level admins and assign them to these departments.\n";

} catch (Exception $e) {
    echo "❌ Error creating departments: " . $e->getMessage() . "\n";
}
