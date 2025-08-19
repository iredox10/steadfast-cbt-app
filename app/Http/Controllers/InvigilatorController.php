<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Exam;
use App\Models\Student;
use Exception;
use Illuminate\Http\Request;
use App\Models\Course;

class InvigilatorController extends Controller
{
    public function generate_ticket(Request $request)
    {
        $validate = $request->validate([
            'student_id' => 'required|numeric',
        ]);

        try {
            $student = Student::findOrFail($validate['student_id']);
            $active_exam = Exam::where('activated', 'yes')->first();

            if (!$active_exam) {
                return response()->json(['error' => 'No active exam found'], 404);
            }

            // Check if a candidate record already exists for this student and exam
            $existingCandidate = Candidate::where('student_id', $student->id)
                ->where('exam_id', $active_exam->id)
                ->first();

            // If a candidate exists and already has a ticket, return the existing ticket
            if ($existingCandidate && $existingCandidate->ticket_no) {
                return response()->json($existingCandidate, 200);
            }

            // Generate a unique 6-digit ticket number
            do {
                $ticket_no = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            } while (Candidate::where('exam_id', $active_exam->id)->where('ticket_no', $ticket_no)->exists());

            $candidate = Candidate::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'exam_id' => $active_exam->id,
                ],
                [
                    'full_name' => $student->full_name,
                    'programme' => $student->programme,
                    'department' => $student->department,
                    'password' => $student->password,
                    'is_logged_on' => 0,
                    'is_checkout' => 0,
                    'checkin_time' => now(),
                    'checkout_time' => '',
                    'ticket_no' => $ticket_no,
                    'status' => 'pending',
                ]
            );

            return response()->json($candidate, 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function get_students(Request $request, $course_id)
    {
        try {
            $course = Course::findOrFail($course_id);
            $students = $course->studentCourses;
            $student_list = [];

            $active_exam = Exam::where('course_id', $course_id)->where('activated', 'yes')->first();

            foreach ($students as $student_course) {
                $student = Student::findOrFail($student_course->student_id);
                if ($active_exam) {
                    $candidate = Candidate::where('student_id', $student->id)
                        ->where('exam_id', $active_exam->id)
                        ->first();
                    $student->ticket_no = $candidate ? $candidate->ticket_no : null;
                    // Add candidate ID for potential future use
                    $student->candidate_id = $candidate ? $candidate->id : null;
                    
                    // Add score if available
                    $score_record = \App\Models\StudentExamScore::where('student_id', $student->id)
                        ->where('course_id', $course_id)
                        ->first();
                    $student->score = $score_record ? $score_record->score : null;
                }
                $student_list[] = $student;
            }

            return response()->json($student_list, 200);
        } catch (Exception $err) {
            return response()->json(['error' => $err->getMessage()], 500);
        }
    }
}