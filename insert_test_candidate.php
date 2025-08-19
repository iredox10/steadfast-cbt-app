<?php

require_once __DIR__.'/bootstrap/app.php';

use App\Models\Candidate;

// Create a test candidate
$candidate = new Candidate();
$candidate->student_id = 1;
$candidate->exam_id = 1;
$candidate->full_name = 'Test Student';
$candidate->programme = 'Computer Science';
$candidate->department = 'Science';
$candidate->candidate_no = 'CS123456';
$candidate->score = 85;
$candidate->save();

echo "Created test candidate with ID: " . $candidate->id . "\n";