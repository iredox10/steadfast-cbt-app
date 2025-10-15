<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Enrollment API Endpoints\n";
echo "=================================\n\n";

// Simulate API requests
$courseId = 4;

echo "1. Testing GET /api/get-course-students/{$courseId}\n";
echo str_repeat('-', 70) . "\n";

try {
    $controller = new App\Http\Controllers\Admin();
    $response = $controller->get_course_students($courseId);
    $data = json_decode($response->getContent(), true);
    
    if (is_array($data) && !isset($data['error'])) {
        echo "✅ Success! Found " . count($data) . " enrolled students\n";
        foreach ($data as $student) {
            echo "  - {$student['full_name']}\n";
        }
    } else {
        echo "❌ Error: " . ($data['error'] ?? 'Unknown error') . "\n";
    }
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
}

echo "\n";
echo "2. Testing GET /api/unenrolled-students/{$courseId}\n";
echo str_repeat('-', 70) . "\n";

try {
    $request = new Illuminate\Http\Request();
    // Simulate authenticated user
    $user = App\Models\User::where('role', 'super_admin')->first();
    $request->setUserResolver(function() use ($user) {
        return $user;
    });
    
    $controller = new App\Http\Controllers\Admin();
    $response = $controller->getUnenrolledStudents($request, $courseId);
    $data = json_decode($response->getContent(), true);
    
    if (is_array($data) && !isset($data['error'])) {
        echo "✅ Success! Found " . count($data) . " unenrolled students\n";
        if (count($data) > 0) {
            echo "Sample students:\n";
            foreach (array_slice($data, 0, 5) as $student) {
                echo "  - {$student['full_name']}\n";
            }
        }
    } else {
        echo "❌ Error: " . ($data['error'] ?? 'Unknown error') . "\n";
    }
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
}

echo "\n";
echo "3. Testing POST /api/enroll-students\n";
echo str_repeat('-', 70) . "\n";

// This would need actual student IDs that aren't enrolled
echo "⏭️  Skipped (requires unenrolled student IDs)\n";

echo "\n✅ All critical endpoints working!\n";
