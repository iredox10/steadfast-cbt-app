<?php

namespace App\Http\Controllers;

use App\Models\Answers;
use App\Models\Candidate;
use App\Models\Course;
use App\Models\Exam;
use App\Models\LecturerCourse;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\Student;
use App\Models\StudentCourse;
use App\Models\StudentExamScore;
use App\Models\User;
use App\Models\ExamArchive;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class Instructor extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $usersQuery = User::whereIn('role', ['lecturer', 'instructor', 'invigilator', 'technician'])->with('level');
            
            // Apply level filtering based on user role
            if ($user && $user->role === 'level_admin' && $user->level_id) {
                // Level admins can only see instructors in their level
                $usersQuery->where('level_id', $user->level_id);
            } elseif ($user && $user->role === 'faculty_officer') {
                // Faculty officers see instructors in all departments of their faculty
                $usersQuery->whereHas('level', function($q) use ($user) {
                    $q->where('faculty_id', $user->faculty_id);
                });
            } elseif ($request->has('level_id') && $request->level_id) {
                // Super admins can filter by specific level
                $usersQuery->where('level_id', $request->level_id);
            }
            // Super admins with no level filter see all instructors

            $users = $usersQuery->orderBy('created_at', 'desc')->get();
            return response()->json($users);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info('Instructor store called with data:', $request->all());
        
        $validate = request()->validate([
            'email' => 'required | email | string | max:255 | unique:users,email',
            'password' => 'nullable| string | max:255',
            'full_name' => 'required| string | max:255',
            'role' => 'required| string | max:255',
            'status' => 'required| string | max:255',
            'level_id' => 'nullable|exists:acd_sessions,id'
        ]);
        
        Log::info('Validation passed, data:', $validate);
        
        $validate['password'] = Hash::make($validate['password'] ?? 'password');
        
        // For level admins, automatically assign their level_id
        $currentUser = $request->user();
        if ($currentUser && $currentUser->role === 'level_admin' && $currentUser->level_id) {
            $validate['level_id'] = $currentUser->level_id;
            Log::info('Level admin detected, setting level_id', ['level_id' => $currentUser->level_id]);
        }
        
        try {
            $user = User::create($validate);
            Log::info('User created successfully:', $user->toArray());
            return response()->json([
                'message' => 'Instructor created successfully',
                'user' => $user->load('level')
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating user:', $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $user = User::findOrFail($id);
            // $courses = LecturerCourse::where('user_id', $id);
            return response()->json($user);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validate = request()->validate([
            'email' => 'required | email | string | max:255',
            'full_name' => 'required | string | max:255',
            'role' => 'required | string | max:255',
            'status' => 'required | string | max:255',
        ]);
        try {
            $user = User::findOrFail($id);
            
            // Check if email is being changed and if it's unique
            if ($validate['email'] !== $user->email) {
                $request->validate([
                    'email' => 'unique:users,email'
                ]);
            }

            $user->update($validate);

            return response()->json([
                'message' => 'User updated successfully',
                'user' => $user
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function resetUserPassword($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->password = Hash::make('password');
            $user->save();

            return response()->json([
                'message' => 'Password reset successfully'
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::find($id);
        $user->delete();

        return response()->json($user);
    }

    // TODO complete this function 
    public function add_exam(Request $request, string $user_id, string $course_id)
    {
        $validate = request()->validate([
            'instructions' => 'string | required',
            'no_of_questions' => 'numeric | required',
            'actual_questions' => 'numeric | required',
            'marks_per_question' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            // 'marks_per_question' => 'numeric | required',
            'max_score' => 'numeric | required',
            'exam_duration' => 'string | required',
            'exam_type' => 'string | required',
        ]);
        try {

            $user = User::find($user_id);
            $course = Course::find($course_id);

            $exam = Exam::create([
                'course_id' => $course->id,
                'user_id' => $user->id,
                'instructions' => $validate['instructions'],
                'max_score' => $validate['max_score'],
                'marks_per_question' => $validate['marks_per_question'],
                'no_of_questions' => $validate['no_of_questions'],
                'actual_questions' => $validate['actual_questions'],
                'exam_duration' => $validate['exam_duration'],
                'exam_type' => $validate['exam_type'],
            ]);

            for ($i = 0; $i < $exam->no_of_questions; $i++) {
                Question::create([
                    'exam_id' => $exam->id,
                    'user_id' => $user->id,
                    'serial_number' => $i + 1
                ]);
            }
            return response()->json($exam, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update_exam(Request $request, $exam_id)
    {
        $validate = request()->validate([
            'instructions' => 'string | required',
            'no_of_questions' => 'numeric | required',
            'actual_questions' => 'numeric | required',
            'marks_per_question' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            'max_score' => 'numeric | required',
            'exam_duration' => 'string | required',
            'exam_type' => 'string | required',
        ]);
        
        try {
            $exam = Exam::findOrFail($exam_id);
            
            // Prevent updating if exam is submitted or finished (double check backend side too)
            if ($exam->finished_time) {
                return response()->json(['error' => 'Cannot update a terminated exam'], 403);
            }
            
            $exam->update([
                'instructions' => $validate['instructions'],
                'max_score' => $validate['max_score'],
                'marks_per_question' => $validate['marks_per_question'],
                'no_of_questions' => $validate['no_of_questions'],
                'actual_questions' => $validate['actual_questions'],
                'exam_duration' => $validate['exam_duration'],
                'exam_type' => $validate['exam_type'],
            ]);

            // Check if we need to add more questions
            $currentQuestionCount = Question::where('exam_id', $exam->id)->count();
            $newQuestionCount = (int)$validate['no_of_questions'];

            if ($newQuestionCount > $currentQuestionCount) {
                for ($i = $currentQuestionCount; $i < $newQuestionCount; $i++) {
                    Question::create([
                        'exam_id' => $exam->id,
                        'user_id' => $exam->user_id,
                        'serial_number' => $i + 1
                    ]);
                }
            } elseif ($newQuestionCount < $currentQuestionCount) {
                // Remove questions from the end (highest serial numbers)
                $diff = $currentQuestionCount - $newQuestionCount;
                
                $idsToDelete = Question::where('exam_id', $exam->id)
                    ->orderByRaw('CAST(serial_number AS UNSIGNED) DESC')
                    ->limit($diff)
                    ->pluck('id');
                    
                Question::destroy($idsToDelete);
            }

            // Re-sequence serial numbers to ensure continuity (1, 2, 3...)
            $remainingQuestions = Question::where('exam_id', $exam->id)
                ->orderByRaw('CAST(serial_number AS UNSIGNED) ASC')
                ->get();
                
            foreach ($remainingQuestions as $index => $question) {
                $newSerial = $index + 1;
                if ($question->serial_number != $newSerial) {
                    $question->serial_number = $newSerial;
                    $question->save();
                }
            }
            
            return response()->json($exam, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function get_exams($user_id, $course_id)
    {
        try {
            $exams = Exam::where('user_id', $user_id)
                ->where('course_id', $course_id)
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Add filled_questions_count to each exam
            foreach ($exams as $exam) {
                $exam->filled_questions_count = Question::where('exam_id', $exam->id)
                    ->whereNotNull('question')
                    ->count();
            }
            
            return response()->json($exams);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function add_question(Request $request, $question_id, $user_id, $course_id, $exam_id)
    {
        $validate = request()->validate([
            'question' => 'string | required',
            'correct_answer' => 'string | required',
            'option_a' => 'string | required',
            'option_b' => 'string | required',
            'option_c' => 'string | nullable',
            'option_d' => 'string | nullable',
        ]);
        try {
            User::findOrFail($user_id);
            Exam::findOrFail($exam_id);
            $question = Question::findOrFail($question_id);

            $question->question = $validate['question'];
            $question->correct_answer = $validate['correct_answer'];
            $question->option_a = $validate['option_a'];
            $question->option_b = $validate['option_b'];
            $question->option_c = $validate['option_c'];
            $question->option_d = $validate['option_d'];

            $question->save();

            // Create question bank entry if question was successfully saved
            if ($question->wasChanged()) {
                $question_bank = QuestionBank::create([
                    'exam_id' => $question->exam_id,
                    'user_id' => $question->user_id,
                    'course_id' => $course_id,
                    'question' => $question->question,
                    'correct_answer' => $question->correct_answer,
                    'option_a' => $question->option_a,
                    'option_b' => $question->option_b,
                    'option_c' => $question->option_c,
                    'option_d' => $question->option_d,
                ]);

                return response()->json([
                    'question' => $question,
                    'question_bank' => $question_bank
                ], 201);
            }

            return response()->json($question, 201);
        } catch (Exception $e) {
            return response()->json($e->getMessage(), 500);
        }
    }

    public function submitExam(Request $request, $exam_id)
    {
        try {
            $exam = Exam::findOrFail($exam_id);
            
            $canSubmit = $exam->submission_status !== 'submitted' || $exam->finished_time !== null;
            
            if (!$canSubmit) {
                return response()->json([
                    'error' => 'This exam has already been submitted and is not terminated yet.'
                ], 400);
            }
            
            if ($exam->finished_time !== null) {
                $exam->finished_time = null;
                $exam->activated = 'no';
                $exam->activated_date = null;
                $exam->invigilator = null;
            }
            
            $exam->submission_status = 'submitted';
            $exam->submission_count = ($exam->submission_count ?? 0) + 1;
            $exam->submission_date = now();
            $exam->save();
            
            return response()->json([
                'message' => 'Exam submitted successfully',
                'exam' => $exam
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function recallExam(Request $request, $exam_id)
    {
        try {
            Log::info('Attempting to recall exam (RAW SQL FIXED): ' . $exam_id);
            
            $exam = Exam::findOrFail($exam_id);
            
            if ($exam->activated === 'yes') {
                return response()->json(['error' => 'Cannot recall an activated exam.'], 400);
            }
            
            if ($exam->submission_status !== 'submitted') {
                return response()->json(['error' => 'Exam is not currently submitted.'], 400);
            }
            
            \Illuminate\Support\Facades\DB::table('exams')
                ->where('id', $exam_id)
                ->update([
                    'submission_status' => 'not_submitted',
                    'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
                ]);
            
            return response()->json([
                'message' => 'Exam recalled successfully',
                'exam' => $exam->fresh()
            ]);
        } catch (Exception $e) {
            Log::error('Error recalling exam: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json(['error' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }
    public function get_exam()
    {
        try {
            $exam = Exam::where('activated', 'yes')->get();
            return response()->json($exam, 200);
        } catch (Exception $e) {
            return response()->json($e);
        }
    }

    public function get_exam_by_id($exam_id)
    {
        try {
            $exam = Exam::findOrFail($exam_id);
            return response()->json($exam);
        } catch (Exception $e) {
            return response()->json($e);
        }
    }

    public function delete_exam($exam_id)
    {
        try {
            Exam::destroy($exam_id);
            return response()->json(['message' => 'Exam deleted successfully']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function get_questions(Request $request, $exam_id)
    {
        $exam = Exam::findOrFail($exam_id)->questions()->orderBy('id')->get();
        return response()->json($exam, 200);
    }

    public function get_question(Request $request, $question_id)
    {
        $question = Question::findOrFail($question_id);
        return response()->json($question, 200);
    }

    public function get_courses(Request $request, $user_id)
    {
        try {
            $lecturerCourses = LecturerCourse::where('user_id', $user_id)->get();
            
            Log::info('get_courses called', [
                'user_id' => $user_id,
                'courses_count' => $lecturerCourses->count()
            ]);
            
            return response()->json($lecturerCourses);
        } catch (Exception $err) {
            Log::error('Error in get_courses', [
                'user_id' => $user_id,
                'error' => $err->getMessage()
            ]);
            return response()->json(['error' => $err->getMessage()], 500);
        }
    }

    public function get_students(Request $request, $user_id, $course_id)
    {
        try {
            $instructor = User::findOrFail($user_id);
            Course::findOrFail($course_id);
            
            $students = Course::findOrFail($course_id)->studentCourses;

            $student_list = [];

            foreach ($students as $student) {
                $std = Student::find($student->student_id);
                if ($std) {
                    if ($instructor->level_id && $std->level_id != $instructor->level_id) {
                        continue;
                    }
                    
                    $student_list[] = $std;
                }
            }

            return response()->json($student_list, 200);
        } catch (Exception $err) {
            return response()->json(['error' => $err->getMessage()], 500);
        }
    }

    public function student_submit_exam($course_id, $candidate_id)
    {
        try {
            $correct_answers = Answers::where('course_id', $course_id)
                ->where('candidate_id', $candidate_id)
                ->where('is_correct', true)
                ->count();
            
            $course = Course::findOrFail($course_id);
            
            $exam = Exam::where('course_id', $course_id)
                ->where('submission_status', 'submitted')
                ->first();
            
            $total_score = $correct_answers * $exam->marks_per_question;

            $exam_score = StudentExamScore::updateOrCreate(
                [
                    'student_id' => $candidate_id,
                    'course_id' => $course_id
                ],
                [
                    'score' => $total_score,
                    'course_name' => $course->title
                ]
            );
            
            return response()->json([
                'correct_answers' => $correct_answers,
                'marks_per_question' => $exam->marks_per_question,
                'total_score' => $total_score,
                'exam_score' => $exam_score
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function get_student_scores_for_course(Request $request, $course_id)
    {
        try {
            $instructor = $request->user();
            
            // Get student scores for this course
            $scores = StudentExamScore::where('course_id', $course_id)->get();
            
            // Get active exam for this course if any
            $activeExam = Exam::where('course_id', $course_id)->where('activated', 'yes')->first();
            
            // Map scores to standard format
            $results = [];
            $seenStudentIds = [];

            foreach ($scores as $score) {
                $student = Student::find($score->student_id);
                if ($student) {
                    if ($instructor && $instructor->level_id && $student->level_id != $instructor->level_id) {
                        continue;
                    }
                    
                    $seenStudentIds[] = $student->id;
                    $results[] = [
                        'id' => $score->id,
                        'student_id' => $student->id,
                        'student' => [
                            'id' => $student->id,
                            'full_name' => $student->full_name,
                            'candidate_no' => $student->candidate_no,
                            'department' => $student->department,
                            'programme' => $student->programme,
                        ],
                        'course_name' => $score->course_name,
                        'score' => $score->score,
                        'status' => 'submitted',
                        'submitted_at' => $score->created_at,
                        'updated_at' => $score->updated_at,
                    ];
                }
            }

            // If there's an active exam, also get candidates who haven't submitted yet
            if ($activeExam) {
                $candidates = Candidate::where('exam_id', $activeExam->id)
                    ->whereNotIn('student_id', $seenStudentIds)
                    ->get();

                foreach ($candidates as $candidate) {
                    $student = Student::find($candidate->student_id);
                    if ($student) {
                        if ($instructor && $instructor->level_id && $student->level_id != $instructor->level_id) {
                            continue;
                        }

                        $results[] = [
                            'id' => 'cand_' . $candidate->id,
                            'student_id' => $student->id,
                            'student' => [
                                'id' => $student->id,
                                'full_name' => $student->full_name,
                                'candidate_no' => $student->candidate_no,
                                'department' => $student->department,
                                'programme' => $student->programme,
                            ],
                            'course_name' => $activeExam->course ? $activeExam->course->title : 'N/A',
                            'score' => 0,
                            'status' => 'in_progress',
                            'submitted_at' => null,
                            'updated_at' => $candidate->updated_at,
                        ];
                    }
                }
            }
            
            return response()->json($results);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function export_student_scores($course_id)
    {
        try {
            $course = Course::findOrFail($course_id);
            $scores = StudentExamScore::where('course_id', $course_id)->get();
            
            $csvContent = "Student ID,Candidate Number,Full Name,Department,Programme,Course Name,Score,Submitted At\n";
            
            foreach ($scores as $score) {
                $student = Student::find($score->student_id);
                if ($student) {
                    $csvRow = [
                        $student->id,
                        '"' . $student->candidate_no . '"',
                        '"' . $student->full_name . '"',
                        '"' . $student->department . '"',
                        '"' . $student->programme . '"',
                        '"' . $score->course_name . '"',
                        $score->score,
                        $score->created_at ? $score->created_at->format('Y-m-d H:i:s') : 'N/A'
                    ];
                    $csvContent .= implode(',', $csvRow) . "\n";
                }
            }
            
            $filename = 'student_scores_' . preg_replace('/[^A-Za-z0-9_\-]/', '_', $course->code) . '_' . date('Y-m-d') . '.csv';
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];
            
            return response($csvContent, 200, $headers);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Course not found'], 404);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function edit_question(Request $request, $question_Id)
    {
        $question = Question::findOrFail($question_Id);
        
        $question->question = $request->question;
        $question->correct_answer = $request->correct_answer;
        $question->option_b = $request->option_b;
        $question->option_c = $request->option_c;
        $question->option_d = $request->option_d;
        
        $question->save();
        
        return response()->json($question, 200);
    }

    public function getQuestionBank($user_id,$course_id)
    {
        try {
            $questions = Course::findOrFail($course_id)->questionBanks;
            return response()->json($questions);
        } catch (Exception $e) {
            return response()->json($e->getMessage(), 400);
        }
    }

    public function getExamQuestionBank($user_id, $exam_id)
    {
        try {
            // Need to find course_id for this exam
            $exam = Exam::findOrFail($exam_id);
            $questions = Course::findOrFail($exam->course_id)->questionBanks;
            return response()->json($questions, 200);
        } catch (Exception $e) {
            return response()->json($e->getMessage(), 400);
        }
    }

    public function get_archive_by_exam($exam_id)
    {
        try {
            $archive = ExamArchive::where('exam_id', $exam_id)->orderBy('id', 'desc')->first();
            if (!$archive) {
                return response()->json(['error' => 'Archive not found'], 404);
            }
            return response()->json($archive);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
