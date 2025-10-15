<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Exam;
use App\Models\Student;
use App\Models\StudentCourse;

echo "Enrolling Missing Mechanical Engineering Students\n";
echo "==================================================\n\n";

// Get active exam
$activeExam = Exam::where('activated', 'yes')->first();

if (!$activeExam) {
    echo "❌ No active exam found!\n";
    exit;
}

echo "Active Exam Level ID: {$activeExam->level_id} (Mechanical Engineering)\n";
echo "Active Exam Course ID: {$activeExam->course_id}\n\n";

// Get ALL students from Mechanical Engineering (Level 6)
$mechanicalStudents = Student::where('level_id', 6)->get();

echo "Enrolling students in course {$activeExam->course_id}...\n";
echo str_repeat('-', 70) . "\n\n";

$enrolled = 0;
$alreadyEnrolled = 0;

foreach ($mechanicalStudents as $student) {
    // Check if already enrolled
    $existingEnrollment = StudentCourse::where('student_id', $student->id)
        ->where('course_id', $activeExam->course_id)
        ->first();
    
    if ($existingEnrollment) {
        echo "  ✓ {$student->full_name} - Already enrolled\n";
        $alreadyEnrolled++;
    } else {
        // Enroll the student
        StudentCourse::create([
            'student_id' => $student->id,
            'course_id' => $activeExam->course_id,
        ]);
        echo "  ✅ {$student->full_name} - NEWLY ENROLLED\n";
        $enrolled++;
    }
}

echo "\n" . str_repeat('=', 70) . "\n";
echo "SUMMARY:\n";
echo str_repeat('=', 70) . "\n";
echo "Students already enrolled: {$alreadyEnrolled}\n";
echo "Students newly enrolled: {$enrolled}\n";
echo "Total enrolled now: " . StudentCourse::where('course_id', $activeExam->course_id)->count() . "\n\n";

if ($enrolled > 0) {
    echo "✅ SUCCESS! The newly enrolled students will now appear in the invigilator page.\n";
    echo "   They still need tickets - the invigilator can generate them by clicking 'Generate Ticket'.\n";
    echo "   OR you can reactivate the exam to auto-generate tickets for all enrolled students.\n";
}
