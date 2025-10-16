<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Exam;
use App\Models\Course;
use App\Models\Student;
use App\Models\ExamTicket;

$exam = Exam::find(5);

if (!$exam) {
    echo "Exam 5 not found\n";
    exit;
}

echo "=== EXAM DETAILS ===\n";
echo "Exam ID: {$exam->id}\n";
echo "Course ID: {$exam->course_id}\n";
echo "Level ID: " . ($exam->level_id ?? 'NULL') . "\n";
echo "Activated: {$exam->activated}\n";
echo "\n";

$course = Course::find($exam->course_id);

if (!$course) {
    echo "Course not found\n";
    exit;
}

echo "=== COURSE DETAILS ===\n";
echo "Course: {$course->course_code} - {$course->course_name}\n";
echo "Total StudentCourses records: {$course->studentCourses->count()}\n";
echo "\n";

echo "=== CHECKING ELIGIBLE STUDENTS ===\n";
$eligibleCount = 0;

foreach ($course->studentCourses as $sc) {
    $student = Student::find($sc->student_id);
    
    if (!$student) {
        echo "❌ Student not found for ID: {$sc->student_id}\n";
        continue;
    }
    
    echo "Student: {$student->candidate_no} ({$student->full_name})\n";
    echo "  - Student Level ID: " . ($student->level_id ?? 'NULL') . "\n";
    
    // Filter by level_id if exam has a level assigned
    if ($exam->level_id && $student->level_id != $exam->level_id) {
        echo "  - ❌ EXCLUDED (level mismatch: {$student->level_id} != {$exam->level_id})\n";
        continue;
    }
    
    echo "  - ✓ ELIGIBLE\n";
    $eligibleCount++;
}

echo "\n";
echo "=== SUMMARY ===\n";
echo "Eligible students: {$eligibleCount}\n";
echo "Tickets in database: " . ExamTicket::where('exam_id', 5)->count() . "\n";
echo "\n";

if ($eligibleCount == 0) {
    echo "⚠️  WARNING: No eligible students found!\n";
    echo "This could be because:\n";
    echo "1. No students are enrolled in this course\n";
    echo "2. Level ID mismatch between exam and students\n";
    echo "3. Students are not properly linked to StudentCourse\n";
}
