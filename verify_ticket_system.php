<?php

require __DIR__ . '/vendor/autoload.php';

use App\Models\Exam;
use App\Models\ExamTicket;
use App\Models\Student;
use App\Models\Course;
use App\Models\StudentCourse;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=================================================\n";
echo "        NEW TICKET SYSTEM VERIFICATION\n";
echo "=================================================\n\n";

// 1. Check if exam_tickets table exists
echo "1. Checking database schema...\n";
try {
    $ticketCount = ExamTicket::count();
    echo "   ✓ exam_tickets table exists\n";
    echo "   Current ticket count: {$ticketCount}\n\n";
} catch (Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// 2. Check for active exam
echo "2. Checking for active exam...\n";
$activeExam = Exam::where('activated', 'yes')->first();
if ($activeExam) {
    echo "   ✓ Active exam found: ID {$activeExam->id}\n";
    echo "   Course ID: {$activeExam->course_id}\n";
    
    // Count enrolled students
    $course = Course::find($activeExam->course_id);
    if ($course) {
        $enrolledCount = $course->studentCourses->count();
        echo "   Enrolled students: {$enrolledCount}\n";
        
        // Count tickets for this exam
        $ticketsForExam = ExamTicket::where('exam_id', $activeExam->id)->count();
        $availableTickets = ExamTicket::where('exam_id', $activeExam->id)->where('is_used', false)->count();
        $usedTickets = ExamTicket::where('exam_id', $activeExam->id)->where('is_used', true)->count();
        
        echo "   Tickets generated: {$ticketsForExam}\n";
        echo "   Available tickets: {$availableTickets}\n";
        echo "   Used tickets: {$usedTickets}\n\n";
        
        if ($ticketsForExam == 0) {
            echo "   ⚠ Warning: No tickets found for active exam!\n";
            echo "   This might be an exam activated with the old system.\n";
            echo "   Terminate and re-activate the exam to use the new ticket system.\n\n";
        } elseif ($ticketsForExam == $enrolledCount) {
            echo "   ✓ Ticket count matches enrolled students!\n\n";
        } else {
            echo "   ⚠ Warning: Ticket count ({$ticketsForExam}) doesn't match enrolled students ({$enrolledCount})\n\n";
        }
    }
} else {
    echo "   ℹ No active exam found\n";
    echo "   Activate an exam to see ticket generation in action.\n\n";
}

// 3. Show some sample tickets (if any)
echo "3. Sample tickets (showing first 10)...\n";
$sampleTickets = ExamTicket::with('student')->take(10)->get();
if ($sampleTickets->count() > 0) {
    echo "   ┌─────────┬──────────┬──────────┬─────────────────────────┐\n";
    echo "   │ Ticket  │ Exam ID  │ Status   │ Assigned To             │\n";
    echo "   ├─────────┼──────────┼──────────┼─────────────────────────┤\n";
    foreach ($sampleTickets as $ticket) {
        $status = $ticket->is_used ? 'USED' : 'AVAILABLE';
        $assignedTo = $ticket->student ? $ticket->student->full_name : 'None';
        printf("   │ %-7s │ %-8s │ %-8s │ %-23s │\n", 
            $ticket->ticket_no, 
            $ticket->exam_id, 
            $status, 
            substr($assignedTo, 0, 23)
        );
    }
    echo "   └─────────┴──────────┴──────────┴─────────────────────────┘\n\n";
} else {
    echo "   ℹ No tickets found in database\n\n";
}

// 4. Summary
echo "4. System Status Summary\n";
echo "   ┌───────────────────────────────────────────────┐\n";

$totalTickets = ExamTicket::count();
$totalAvailable = ExamTicket::where('is_used', false)->count();
$totalUsed = ExamTicket::where('is_used', true)->count();

echo "   │ Total Tickets:          " . str_pad($totalTickets, 15) . "   │\n";
echo "   │ Available Tickets:      " . str_pad($totalAvailable, 15) . "   │\n";
echo "   │ Used Tickets:           " . str_pad($totalUsed, 15) . "   │\n";
echo "   └───────────────────────────────────────────────┘\n\n";

// 5. Check model relationships
echo "5. Verifying model relationships...\n";
try {
    if ($activeExam) {
        $examTickets = $activeExam->tickets()->count();
        echo "   ✓ Exam->tickets() relationship works\n";
        echo "   Tickets linked to exam: {$examTickets}\n\n";
    } else {
        echo "   ℹ No active exam to test relationships\n\n";
    }
} catch (Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n\n";
}

echo "=================================================\n";
echo "                 VERIFICATION COMPLETE\n";
echo "=================================================\n\n";

if ($activeExam && $ticketsForExam > 0) {
    echo "✅ New ticket system is ACTIVE and WORKING!\n\n";
    echo "Next steps:\n";
    echo "1. Test student login with an available ticket\n";
    echo "2. Verify ticket gets assigned to student\n";
    echo "3. Test re-login with same ticket\n";
    echo "4. Terminate exam and verify tickets are deleted\n\n";
} elseif ($activeExam && $ticketsForExam == 0) {
    echo "⚠️  Active exam is using the OLD ticket system\n\n";
    echo "To switch to new system:\n";
    echo "1. Terminate the current exam\n";
    echo "2. Re-activate it\n";
    echo "3. New tickets will be generated automatically\n\n";
} else {
    echo "ℹ️  No active exam - System ready!\n\n";
    echo "To test the new ticket system:\n";
    echo "1. Go to admin dashboard\n";
    echo "2. Activate an exam\n";
    echo "3. Run this script again to see tickets\n\n";
}

echo "For more information, see:\n";
echo "- NEW_TICKET_SYSTEM.md (technical documentation)\n";
echo "- TICKET_SYSTEM_QUICK_START.md (user guide)\n";
echo "- TICKET_SYSTEM_IMPLEMENTATION_SUMMARY.md (overview)\n";
