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

    public function regenerate_ticket(Request $request)
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

            // Find the existing candidate record
            $candidate = Candidate::where('student_id', $student->id)
                ->where('exam_id', $active_exam->id)
                ->first();

            if (!$candidate) {
                return response()->json(['error' => 'No candidate record found for this student'], 404);
            }

            // Generate a new unique 6-digit ticket number
            do {
                $new_ticket_no = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            } while (Candidate::where('exam_id', $active_exam->id)->where('ticket_no', $new_ticket_no)->exists());

            // Update the candidate with new ticket and reset login status
            $candidate->update([
                'ticket_no' => $new_ticket_no,
                'is_logged_on' => 0, // Reset login status so they can login with new ticket
                'checkin_time' => now(), // Update checkin time
            ]);

            return response()->json([
                'message' => 'New ticket generated successfully',
                'candidate' => $candidate,
                'new_ticket' => $new_ticket_no
            ], 200);
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
            
            // Get the authenticated user (invigilator)
            $invigilator = $request->user();

            foreach ($students as $student_course) {
                $student = Student::findOrFail($student_course->student_id);
                
                // Filter students by the invigilator's level_id (department)
                // This ensures invigilators only see students from their own department
                if ($invigilator && $invigilator->level_id && $student->level_id != $invigilator->level_id) {
                    continue; // Skip students not in the invigilator's department
                }
                
                // Also allow super admin filtering via query parameter
                if ($request->has('level_id') && $request->level_id && $student->level_id != $request->level_id) {
                    continue; // Skip students not in the specified level
                }
                
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
                    // Add time extension information
                    $student->time_extension = $candidate ? $candidate->time_extension : 0;
                }
                $student_list[] = $student;
            }

            return response()->json($student_list, 200);
        } catch (Exception $err) {
            return response()->json(['error' => $err->getMessage()], 500);
        }
    }

    public function extend_time(Request $request)
    {
        $validate = $request->validate([
            'student_id' => 'required|numeric',
            'exam_id' => 'required|numeric',
            'extension_minutes' => 'required|numeric|min:1'
        ]);

        try {
            // Find the active exam
            $active_exam = Exam::where('id', $validate['exam_id'])
                             ->where('activated', 'yes')
                             ->first();

            if (!$active_exam) {
                return response()->json(['error' => 'No active exam found. Please make sure an exam is activated.'], 404);
            }

            // Find the student
            $student = Student::findOrFail($validate['student_id']);

            // Find or create the candidate
            $candidate = Candidate::where('student_id', $validate['student_id'])
                                ->where('exam_id', $active_exam->id)
                                ->first();

            if (!$candidate) {
                // Create candidate record if it doesn't exist
                $candidate = Candidate::create([
                    'student_id' => $student->id,
                    'exam_id' => $active_exam->id,
                    'full_name' => $student->full_name,
                    'programme' => $student->programme,
                    'department' => $student->department,
                    'password' => $student->password,
                    'is_logged_on' => 0,
                    'is_checkout' => 0,
                    'checkin_time' => now(),
                    'checkout_time' => '',
                    'ticket_no' => null, // Will be generated when needed
                    'status' => 'pending',
                    'time_extension' => 0
                ]);
            }

            // Get current extension and add new extension
            $current_extension = (int)($candidate->time_extension ?? 0);
            $extension_minutes = (int)$validate['extension_minutes'];
            $new_extension = $current_extension + $extension_minutes;

            // Update the candidate's time extension
            $candidate->update([
                'time_extension' => $new_extension
            ]);

            return response()->json([
                'message' => 'Time extended successfully',
                'time_extension' => $new_extension,
                'student_name' => $student->full_name
            ], 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function terminate_exam($course_id)
    {
        try {
            // Get the active exam
            $exam = Exam::where('course_id', $course_id)
                    ->where('activated', 'yes')
                    ->first();

            if (!$exam) {
                return response()->json(['message' => 'No active exam found'], 404);
            }

            // Reset all time extensions to 0 when terminating exam
            Candidate::where('exam_id', $exam->id)
                ->update([
                    'time_extension' => 0,
                    'is_logged_on' => false,
                    'is_checkout' => true,
                    'status' => 'completed'
                ]);

            // Deactivate the exam
            $exam->update(['activated' => 'no']);

            return response()->json([
                'message' => 'Exam terminated successfully and all time extensions cleared'
            ], 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}