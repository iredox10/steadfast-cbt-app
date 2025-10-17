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

    public function checkin_student(Request $request)
    {
        try {
            $validate = $request->validate([
                'student_id' => 'required|numeric',
                'course_id' => 'required|numeric',
            ]);

            \Log::info('Check-in request received', $validate);

            $student = Student::findOrFail($validate['student_id']);
            \Log::info('Student found', ['student_id' => $student->id, 'name' => $student->full_name]);

            $active_exam = Exam::where('course_id', $validate['course_id'])
                ->where('activated', 'yes')
                ->first();

            if (!$active_exam) {
                \Log::error('No active exam found', ['course_id' => $validate['course_id']]);
                return response()->json(['error' => 'No active exam found for this course'], 404);
            }

            \Log::info('Active exam found', ['exam_id' => $active_exam->id]);

            // Check if student is enrolled in this course
            $studentCourse = \App\Models\StudentCourse::where('student_id', $student->id)
                ->where('course_id', $validate['course_id'])
                ->first();

            if (!$studentCourse) {
                \Log::error('Student not enrolled in course', [
                    'student_id' => $student->id,
                    'course_id' => $validate['course_id']
                ]);
                return response()->json(['error' => 'Student is not enrolled in this course'], 404);
            }

            // Find or create candidate record
            $candidate = Candidate::where('student_id', $student->id)
                ->where('exam_id', $active_exam->id)
                ->first();

            if (!$candidate) {
                \Log::info('Candidate record not found, creating one', [
                    'student_id' => $student->id,
                    'exam_id' => $active_exam->id
                ]);

                // Create candidate record for this student
                $candidate = Candidate::create([
                    'student_id' => $student->id,
                    'exam_id' => $active_exam->id,
                    'full_name' => $student->full_name,
                    'programme' => $student->programme,
                    'department' => $student->department,
                    'image' => $student->image,
                    'password' => $student->password,
                    'is_logged_on' => 0,
                    'is_checkout' => 0,
                    'is_checked_in' => false,
                    'checkin_time' => null,
                    'checkout_time' => null,
                    'ticket_no' => null, // Will be assigned when student logs in
                    'status' => 'pending',
                ]);

                \Log::info('Candidate record created', ['candidate_id' => $candidate->id]);
            }

            \Log::info('Candidate found/created', ['candidate_id' => $candidate->id]);

            // Mark student as checked in
            $candidate->update([
                'is_checked_in' => true,
                'checkin_time' => now(),
            ]);

            \Log::info('Candidate updated with check-in status');

            // Also update student record if needed
            $student->update([
                'is_checked_in' => true,
            ]);

            \Log::info('Student record updated with check-in status');

            return response()->json([
                'message' => 'Student checked in successfully',
                'student' => $student,
                'checkin_time' => $candidate->checkin_time,
                'is_checked_in' => true
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error', ['errors' => $e->errors()]);
            return response()->json(['error' => 'Validation failed: ' . json_encode($e->errors())], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Model not found', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Student or exam not found'], 404);
        } catch (Exception $e) {
            \Log::error('Check-in error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
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
                    // Add check-in status
                    $student->is_checked_in = $candidate ? ($candidate->is_checked_in ?? false) : false;
                    $student->checkin_time = $candidate ? $candidate->checkin_time : null;
                    
                    // Use candidate image if available, otherwise use student image
                    if ($candidate && $candidate->image) {
                        $student->image = $candidate->image;
                    }
                    
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