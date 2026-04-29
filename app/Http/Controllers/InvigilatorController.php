<?php

namespace App\Http\Controllers;

use App\Models\Answers;
use App\Models\Candidate;
use App\Models\Course;
use App\Models\Exam;
use App\Models\ExamArchive;
use App\Models\ExamTicket;
use App\Models\ExamViolation;
use App\Models\Question;
use App\Models\Student;
use App\Models\StudentExamScore;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;

class InvigilatorController extends Controller
{
    public function generate_ticket(Request $request)
    {
        return response()->json([
            'error' => 'Ticket generation is no longer available.',
            'message' => 'Tickets are automatically assigned when students login.',
        ], 400);
    }

    public function regenerate_ticket(Request $request)
    {
        return response()->json([
            'error' => 'Ticket regeneration has been disabled.',
        ], 403);
    }

    public function checkin_student(Request $request)
    {
        try {
            $validate = $request->validate([
                'student_id' => 'required|numeric',
                'course_id' => 'required|numeric',
            ]);

            $student = Student::findOrFail($validate['student_id']);
            $active_exam = Exam::where('course_id', $validate['course_id'])
                ->where('activated', 'yes')
                ->first();

            if (! $active_exam) {
                return response()->json(['error' => 'No active exam found for this course'], 404);
            }

            // Check if student is enrolled
            $isEnrolled = \App\Models\StudentCourse::where('student_id', $student->id)
                ->where('course_id', $validate['course_id'])
                ->exists();

            if (! $isEnrolled) {
                return response()->json(['error' => 'Student is not enrolled in this course'], 404);
            }

            /*
            // Check if there are available tickets
            $availableTicketsCount = ExamTicket::where('exam_id', $active_exam->id)
                ->whereNull('assigned_to_student_id')
                ->where('is_used', false)
                ->count();

            if ($availableTicketsCount === 0) {
                return response()->json(['error' => 'No available tickets for this exam.'], 404);
            }
            */

            $candidate = Candidate::where('student_id', $student->id)
                ->where('exam_id', $active_exam->id)
                ->first();

            if (! $candidate) {
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
                    'is_checked_in' => true,
                    'checkin_time' => now(),
                    'status' => 'pending',
                ]);
            } else {
                $candidate->update([
                    'is_checked_in' => true,
                    'checkin_time' => now(),
                ]);
            }

            $student->update(['is_checked_in' => true]);

            \App\Models\ActivityLog::log('check-in', "Checked in student {$student->candidate_no}", auth()->id());

            return response()->json([
                'message' => 'Student checked in successfully.',
                'student' => $student,
                'is_checked_in' => true,
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
            if (! $active_exam) {
                $active_exam = Exam::where('course_id', $course_id)->latest()->first();
            }

            $invigilator = $request->user();
            $levelFilter = $request->query('level_id');

            foreach ($students as $student_course) {
                $student = Student::with('level')->find($student_course->student_id);
                if (! $student) {
                    continue;
                }

                // Filter by level_id query parameter if provided
                if ($levelFilter && $levelFilter !== 'all' && $student->level_id != $levelFilter) {
                    continue;
                }

                // Role-based filtering
                if ($invigilator->role === 'level_admin' && $student->level_id != $invigilator->level_id) {
                    continue;
                } elseif ($invigilator->role === 'faculty_officer') {
                    // Check if student belongs to a department in this faculty
                    if (! $student->level || $student->level->faculty_id != $invigilator->faculty_id) {
                        continue;
                    }
                }

                if ($active_exam) {
                    $candidate = Candidate::where('student_id', $student->id)
                        ->where('exam_id', $active_exam->id)
                        ->first();
                    $ticketRecord = ExamTicket::where('exam_id', $active_exam->id)
                        ->where('assigned_to_student_id', $student->id)
                        ->first();

                    // $student->ticket_no = $ticketRecord ? $ticketRecord->ticket_no : ($candidate ? $candidate->ticket_no : null);
                    $student->exam_id = $active_exam->id;
                    $student->time_extension = $candidate ? $candidate->time_extension : 0;
                    $student->is_submitted = $candidate ? ($candidate->is_checkout == 1 || $candidate->status === 'submitted') : false;
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
        try {
            $validate = $request->validate([
                'student_id' => 'required|numeric',
                'exam_id' => 'required|numeric',
                'extension_minutes' => 'required|numeric|min:1',
            ]);

            $active_exam = Exam::findOrFail($validate['exam_id']);
            $student = Student::findOrFail($validate['student_id']);
            $candidate = Candidate::where('student_id', $student->id)
                ->where('exam_id', $active_exam->id)
                ->first();

            if (! $candidate) {
                return response()->json(['error' => 'Candidate record not found.'], 404);
            }

            $current_extension = (int) ($candidate->time_extension ?? 0);
            $extension_minutes = (int) $validate['extension_minutes'];

            // To ensure the student actually gets the added minutes applied to their REMAINING time,
            // we must account for any time that has elapsed *past* their total allowed time (debt).
            // If they are already in negative time (debt), adding 5 mins might just bring them to -1 min.
            // By adding the debt to the new extension, we guarantee they get exactly $extension_minutes of POSITIVE time.
            if ($candidate->start_time) {
                $startTime = \Carbon\Carbon::parse($candidate->start_time);
                $elapsed_seconds = $startTime->diffInSeconds(now());
                $total_allowed_seconds = ($active_exam->exam_duration + $current_extension) * 60;

                if ($elapsed_seconds > $total_allowed_seconds) {
                    // Calculate how many minutes they are over their limit
                    $debt_minutes = (int) ceil(($elapsed_seconds - $total_allowed_seconds) / 60);
                    // Forgive the debt by advancing the start_time, giving them exact extension_minutes
                    $startTime->addMinutes($debt_minutes);
                    $candidate->start_time = $startTime->toIso8601String();
                    $new_extension = $current_extension + $extension_minutes;
                } else {
                    $new_extension = $current_extension + $extension_minutes;
                }
            } else {
                $new_extension = $current_extension + $extension_minutes;
            }

            $was_submitted = ($candidate->is_checkout == 1 || $candidate->status === 'submitted');

            $candidateUpdateData = [
                'time_extension' => $new_extension,
                'status' => 'active',
            ];

            if ($was_submitted) {
                // If they had already submitted, reopen their session and require check-in again
                $candidateUpdateData['is_checkout'] = 0;
                $candidateUpdateData['is_checked_in'] = 0;
                $candidateUpdateData['checkout_time'] = null;
                $student->update(['is_checked_in' => 0, 'checkout_time' => null, 'is_logged_on' => 'no']);
            }

            $candidate->update($candidateUpdateData);

            \App\Models\ActivityLog::log('time-extension', "Extended time by {$extension_minutes} mins for {$student->candidate_no}", auth()->id());

            return response()->json([
                'message' => 'Time extended successfully',
                'time_extension' => $new_extension,
                'student_name' => $student->full_name,
            ], 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function start_exam($course_id)
    {
        try {
            $user = auth()->user();
            if ($user->role !== 'technician' && $user->role !== 'invigilator') {
                return response()->json(['error' => 'Only technicians or invigilators can start the exam.'], 403);
            }

            $exam = Exam::where('course_id', $course_id)
                ->where('activated', 'yes')
                ->first();

            if (! $exam) {
                return response()->json(['error' => 'No active exam found'], 404);
            }

            if ($exam->timer_mode !== 'global') {
                return response()->json(['error' => 'Manual start is only available for global timer mode.'], 400);
            }

            if ($exam->timer_start_type !== 'manual') {
                return response()->json(['error' => 'This exam uses scheduled start. Timer will begin at the scheduled time.'], 400);
            }

            if ($exam->activated_date) {
                return response()->json(['error' => 'Exam timer has already started.'], 400);
            }

            $exam->update(['activated_date' => now()]);

            \App\Models\ActivityLog::log('exam-start', 'Technician started global timer for exam: '.($exam->title ?? $exam->exam_type), $user->id);

            return response()->json(['message' => 'Exam timer started successfully. All students now share the same countdown.', 'started_at' => now()]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function terminate_exam($course_id)
    {
        try {
            $exam = Exam::where('course_id', $course_id)
                ->where('activated', 'yes')
                ->first();

            if (! $exam) {
                return response()->json(['message' => 'No active exam found'], 404);
            }

            // Time Check: Prevent termination before duration has elapsed
            if ($exam->activated === 'yes' && $exam->activated_date) {
                $now = now();
                $duration = (int) $exam->exam_duration;
                $timerMode = $exam->timer_mode ?? 'individual';

                if ($timerMode === 'global') {
                    $lockEndTime = Carbon::parse($exam->activated_date)->addMinutes($duration);
                } else {
                    $globalEndTime = Carbon::parse($exam->activated_date)->addMinutes($duration);

                    $latestCandidateEndTime = Candidate::where('exam_id', $exam->id)
                        ->get()
                        ->map(function ($c) use ($duration) {
                            if (! $c->start_time) {
                                return null;
                            }

                            return Carbon::parse($c->start_time)->addMinutes($duration + (int) ($c->time_extension ?? 0));
                        })
                        ->filter()
                        ->max();

                    $lockEndTime = $latestCandidateEndTime ? $globalEndTime->max($latestCandidateEndTime) : $globalEndTime;
                }

                if ($now->lt($lockEndTime)) {
                    $remainingMinutes = ceil($now->diffInMinutes($lockEndTime, false));

                    return response()->json([
                        'error' => "Exam cannot be terminated yet. Please wait for the allocated time to elapse ($remainingMinutes minutes remaining).",
                        'remaining_minutes' => $remainingMinutes,
                        'lock_end_time' => $lockEndTime->toDateTimeString(),
                    ], 403);
                }
            }

            $exam_id = $exam->id;
            $course = Course::findOrFail($exam->course_id);
            $totalQuestions = Question::where('exam_id', $exam_id)->count();
            $totalMarks = $exam->marks_per_question * $totalQuestions;

            $studentResults = Student::whereHas('candidates', function ($query) use ($exam_id) {
                $query->where('exam_id', $exam_id);
            })
                ->with(['candidates' => fn ($q) => $q->where('exam_id', $exam_id), 'examScores' => fn ($q) => $q->where('course_id', $exam->course_id)])
                ->get()
                ->map(function ($student) use ($exam, $exam_id) {
                    $candidate = $student->candidates->first();
                    $examScore = $student->examScores->first();
                    $questionsAnswered = $candidate ? Answers::where('course_id', $exam->course_id)->where('candidate_id', $student->id)->count() : 0;
                    $correctAnswers = $candidate ? Answers::where('course_id', $exam->course_id)->where('candidate_id', $student->id)->where('is_correct', true)->count() : 0;
                    $violationCount = ExamViolation::where('student_id', $student->id)->where('exam_id', $exam_id)->count();

                    return [
                        'student_id' => $student->id,
                        'candidate_no' => $student->candidate_no,
                        'full_name' => $student->full_name,
                        'department' => $student->department,
                        'programme' => $student->programme,
                        'level_id' => $student->level_id,
                        'score' => $examScore ? $examScore->score : 0,
                        'submission_time' => $candidate ? $candidate->created_at : null,
                        'questions_answered' => $questionsAnswered,
                        'correct_answers' => $correctAnswers,
                        'submission_reason' => $candidate ? ($candidate->submission_reason ?? 'manual') : 'manual',
                        'violation_count' => $violationCount,
                    ];
                })->toArray();

            $terminator = auth()->user();
            $activator = $exam->activator;

            ExamArchive::create([
                'exam_id' => $exam_id,
                'exam_title' => $exam->title ?? $course->title.' Exam',
                'course_title' => $course->title,
                'exam_date' => $exam->activated_date ?? now(),
                'duration' => $exam->exam_duration,
                'total_questions' => $totalQuestions,
                'marks_per_question' => $exam->marks_per_question,
                'total_marks' => $totalMarks,
                'student_results' => $studentResults,
                'activated_by_name' => $activator ? $activator->full_name : 'N/A',
                'terminated_by_name' => $terminator ? $terminator->full_name : 'N/A',
            ]);

            $studentIds = Candidate::where('exam_id', $exam_id)->pluck('student_id')->toArray();
            if (! empty($studentIds)) {
                Student::whereIn('id', $studentIds)->update([
                    'is_logged_on' => 'no',
                    'checkin_time' => null,
                    'checkout_time' => null,
                    'is_checked_in' => false,
                ]);
            }

            ExamViolation::where('exam_id', $exam_id)->delete();
            Answers::where('course_id', $exam->course_id)->delete();
            StudentExamScore::where('course_id', $exam->course_id)->delete();

            Candidate::where('exam_id', $exam_id)->delete();
            ExamTicket::where('exam_id', $exam_id)->delete();

            $exam->update(['activated' => 'no', 'invigilator' => null, 'finished_time' => now()]);

            return response()->json(['message' => 'Exam terminated successfully'], 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
