<?php

namespace App\Http\Controllers;

use App\Models\Acd_session;
use App\Models\Answers;
use App\Models\Candidate;
use App\Models\Course;
use App\Models\Exam;
use App\Models\ExamArchive;
use App\Models\LecturerCourse;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\Student;
use App\Models\StudentExamScore;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class Instructor extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $usersQuery = User::whereIn('role', ['lecturer', 'instructor', 'invigilator', 'technician'])->with(['level.faculty']);

            if ($user && $user->role === 'level_admin' && $user->level_id) {
                $usersQuery->where('level_id', $user->level_id);
            } elseif ($user && $user->role === 'faculty_officer') {
                $usersQuery->whereHas('level', function ($q) use ($user) {
                    $q->where('faculty_id', $user->faculty_id);
                });
            } elseif ($request->has('level_id') && $request->level_id) {
                $usersQuery->where('level_id', $request->level_id);
            }

            $users = $usersQuery->orderBy('created_at', 'desc')->get();

            return response()->json($users);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $validate = request()->validate([
            'email' => 'required | email | string | max:255 | unique:users,email',
            'password' => 'nullable| string | max:255',
            'full_name' => 'required| string | max:255',
            'role' => 'required| string | max:255',
            'status' => 'required| string | max:255',
            'level_id' => 'nullable|exists:acd_sessions,id',
        ]);

        $validate['password'] = Hash::make($validate['password'] ?? 'password');

        $currentUser = $request->user();
        if ($currentUser && $currentUser->role === 'level_admin' && $currentUser->level_id) {
            $validate['level_id'] = $currentUser->level_id;
        }

        try {
            $user = User::create($validate);

            return response()->json([
                'message' => 'Instructor created successfully',
                'user' => $user->load('level'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $user = User::findOrFail($id);

            return response()->json($user);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

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
            if ($validate['email'] !== $user->email) {
                $request->validate(['email' => 'unique:users,email']);
            }
            $user->update($validate);

            return response()->json(['message' => 'User updated successfully', 'user' => $user]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function resetUserPassword($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->password = Hash::make('password');
            $user->force_password_change = true;
            $user->save();

            return response()->json(['message' => 'Password reset successfully']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(string $id)
    {
        $user = User::find($id);
        $user->delete();

        return response()->json($user);
    }

    public function add_exam(Request $request, string $user_id, string $course_id)
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
            $user = User::findOrFail($user_id);
            $course = Course::findOrFail($course_id);
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
                Question::create(['exam_id' => $exam->id, 'user_id' => $user->id, 'serial_number' => $i + 1]);
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
            if ($exam->finished_time) {
                return response()->json(['error' => 'Cannot update a terminated exam'], 403);
            }
            $exam->update($validate);
            $currentCount = Question::where('exam_id', $exam->id)->count();
            $newCount = (int) $validate['no_of_questions'];
            if ($newCount > $currentCount) {
                for ($i = $currentCount; $i < $newCount; $i++) {
                    Question::create(['exam_id' => $exam->id, 'user_id' => $exam->user_id, 'serial_number' => $i + 1]);
                }
            } elseif ($newCount < $currentCount) {
                $ids = Question::where('exam_id', $exam->id)->orderByRaw('CAST(serial_number AS UNSIGNED) DESC')->limit($currentCount - $newCount)->pluck('id');
                Question::destroy($ids);
            }
            $remaining = Question::where('exam_id', $exam->id)->orderByRaw('CAST(serial_number AS UNSIGNED) ASC')->get();
            foreach ($remaining as $index => $q) {
                $q->update(['serial_number' => $index + 1]);
            }

            return response()->json($exam, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function get_exams($user_id, $course_id)
    {
        try {
            $exams = Exam::where(['user_id' => $user_id, 'course_id' => $course_id])->orderBy('created_at', 'desc')->get();
            foreach ($exams as $exam) {
                $exam->filled_questions_count = Question::where('exam_id', $exam->id)->whereNotNull('question')->count();
            }

            return response()->json($exams);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function add_question(Request $request, $question_id, $user_id, $course_id, $exam_id)
    {
        $v = request()->validate(['question' => 'string|required', 'correct_answer' => 'string|required', 'option_a' => 'string|required', 'option_b' => 'string|required', 'option_c' => 'string|nullable', 'option_d' => 'string|nullable']);
        try {
            $q = Question::findOrFail($question_id);
            $q->update($v);
            if ($q->wasChanged()) {
                QuestionBank::create(['exam_id' => $exam_id, 'user_id' => $user_id, 'course_id' => $course_id, 'question' => $q->question, 'correct_answer' => $q->correct_answer, 'option_a' => $q->option_a, 'option_b' => $q->option_b, 'option_c' => $q->option_c, 'option_d' => $q->option_d]);
            }

            return response()->json($q, 201);
        } catch (Exception $e) {
            return response()->json($e->getMessage(), 500);
        }
    }

    public function submitExam(Request $request, $exam_id)
    {
        try {
            $exam = Exam::with(['course.semester.acdSession', 'user'])->findOrFail($exam_id);
            if ($exam->submission_status === 'submitted' && ! $exam->finished_time) {
                return response()->json(['error' => 'Already submitted'], 400);
            }
            $exam->update(['submission_status' => 'submitted', 'submission_count' => ($exam->submission_count ?? 0) + 1, 'submission_date' => now(), 'finished_time' => null, 'activated' => 'no']);

            // Notify admins
            $facultyId = $exam->course->semester->acdSession->faculty_id ?? null;
            $levelId = $exam->level_id ?? $exam->course->semester->acd_session_id ?? null;
            $courseCreatorId = $exam->course->created_by ?? null;
            $instructorName = $exam->user->full_name ?? 'An instructor';
            $courseTitle = $exam->course->title ?? 'a course';

            $admins = User::whereIn('role', ['super_admin', 'faculty_officer', 'level_admin'])->get();
            foreach ($admins as $admin) {
                if ($admin->role === 'super_admin' ||
                   ($admin->role === 'faculty_officer' && $admin->faculty_id == $facultyId) ||
                   ($admin->role === 'level_admin' && ($admin->level_id == $levelId || $admin->id == $courseCreatorId))) {
                    $admin->notify(new \App\Notifications\AdminNotification(
                        "{$instructorName} has submitted a new exam for {$courseTitle}.",
                        'exam-submission',
                        "/admin-exam/{$admin->id}",
                        'file'
                    ));
                }
            }

            \App\Models\ActivityLog::log('submission', "{$instructorName} submitted {$courseTitle} exam", $exam->user_id);

            return response()->json(['message' => 'Submitted', 'exam' => $exam]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function recallExam(Request $request, $exam_id)
    {
        try {
            $exam = Exam::with(['course.semester.acdSession', 'user'])->findOrFail($exam_id);
            if ($exam->activated === 'yes') {
                return response()->json(['error' => 'Active exam'], 400);
            }
            \Illuminate\Support\Facades\DB::table('exams')->where('id', $exam_id)->update(['submission_status' => 'not_submitted', 'updated_at' => now()]);

            // Notify admins
            $facultyId = $exam->course->semester->acdSession->faculty_id ?? null;
            $levelId = $exam->level_id ?? $exam->course->semester->acd_session_id ?? null;
            $courseCreatorId = $exam->course->created_by ?? null;
            $instructorName = $exam->user->full_name ?? 'An instructor';
            $courseTitle = $exam->course->title ?? 'a course';

            $admins = User::whereIn('role', ['super_admin', 'faculty_officer', 'level_admin'])->get();
            foreach ($admins as $admin) {
                if ($admin->role === 'super_admin' ||
                   ($admin->role === 'faculty_officer' && $admin->faculty_id == $facultyId) ||
                   ($admin->role === 'level_admin' && ($admin->level_id == $levelId || $admin->id == $courseCreatorId))) {
                    $admin->notify(new \App\Notifications\AdminNotification(
                        "{$instructorName} has recalled the exam for {$courseTitle}.",
                        'exam-recall',
                        "/admin-exam/{$admin->id}",
                        'bell'
                    ));
                }
            }

            \App\Models\ActivityLog::log('admin', "{$instructorName} recalled {$courseTitle} exam", $exam->user_id);

            return response()->json(['message' => 'Recalled', 'exam' => $exam->fresh()]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function get_exam_by_id($exam_id)
    {
        try {
            return response()->json(Exam::findOrFail($exam_id));
        } catch (Exception $e) {
            return response()->json($e->getMessage(), 404);
        }
    }

    public function delete_exam($exam_id)
    {
        try {
            Exam::destroy($exam_id);

            return response()->json(['message' => 'Deleted']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function get_questions(Request $request, $exam_id)
    {
        return response()->json(Exam::findOrFail($exam_id)->questions()->orderBy('id')->get());
    }

    public function get_question(Request $request, $question_id)
    {
        return response()->json(Question::findOrFail($question_id));
    }

    public function get_courses(Request $request, $user_id)
    {
        return response()->json(LecturerCourse::where('user_id', $user_id)->get());
    }

    public function get_students(Request $request, $user_id, $course_id)
    {
        try {
            $instr = User::findOrFail($user_id);
            $students = Course::findOrFail($course_id)->studentCourses;
            $list = [];
            foreach ($students as $sc) {
                if ($s = Student::find($sc->student_id)) {
                    if ($instr->role === 'level_admin' && $s->level_id != $instr->level_id) {
                        continue;
                    }
                    if ($instr->role === 'faculty_officer' && (! $s->level || $s->level->faculty_id != $instr->faculty_id)) {
                        continue;
                    }
                    $list[] = $s;
                }
            }

            return response()->json($list);
        } catch (Exception $err) {
            return response()->json(['error' => $err->getMessage()], 500);
        }
    }

    public function get_student_scores_for_course(Request $request, $course_id)
    {
        try {
            $instr = $request->user();
            $scores = StudentExamScore::where('course_id', $course_id)->get();
            $activeExam = Exam::where(['course_id' => $course_id, 'activated' => 'yes'])->first();
            $results = [];
            $seen = [];
            foreach ($scores as $score) {
                if ($s = Student::with('level')->find($score->student_id)) {
                    if ($instr->role === 'level_admin' && $s->level_id != $instr->level_id) {
                        continue;
                    }
                    if ($instr->role === 'faculty_officer' && (! $s->level || $s->level->faculty_id != $instr->faculty_id)) {
                        continue;
                    }
                    $seen[] = $s->id;

                    $questions_answered = Answers::where(['course_id' => $course_id, 'candidate_id' => $s->id])->count();
                    $correct_answers = Answers::where(['course_id' => $course_id, 'candidate_id' => $s->id, 'is_correct' => true])->count();

                    $results[] = [
                        'id' => $score->id,
                        'student_id' => $s->id,
                        'student' => $s->toArray(),
                        'course_name' => $score->course_name,
                        'score' => $score->score,
                        'status' => 'submitted',
                        'submitted_at' => $score->created_at,
                        'questions_answered' => $questions_answered,
                        'correct_answers' => $correct_answers,
                    ];
                }
            }
            if ($activeExam) {
                $cands = Candidate::where('exam_id', $activeExam->id)->whereNotIn('student_id', $seen)->get();
                foreach ($cands as $c) {
                    if ($s = Student::with('level')->find($c->student_id)) {
                        if ($instr->role === 'level_admin' && $s->level_id != $instr->level_id) {
                            continue;
                        }
                        if ($instr->role === 'faculty_officer' && (! $s->level || $s->level->faculty_id != $instr->faculty_id)) {
                            continue;
                        }

                        $questions_answered = Answers::where(['course_id' => $course_id, 'candidate_id' => $s->id])->count();
                        $correct_answers = Answers::where(['course_id' => $course_id, 'candidate_id' => $s->id, 'is_correct' => true])->count();

                        $results[] = [
                            'id' => 'cand_'.$c->id,
                            'student_id' => $s->id,
                            'student' => $s->toArray(),
                            'course_name' => $activeExam->course->title ?? 'N/A',
                            'score' => 0,
                            'status' => 'in_progress',
                            'submitted_at' => null,
                            'questions_answered' => $questions_answered,
                            'correct_answers' => $correct_answers,
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
            $c = Course::findOrFail($course_id);
            $scores = StudentExamScore::where('course_id', $course_id)->get();
            $csv = "Student ID,Candidate Number,Full Name,Department,Programme,Course Name,Score,Submitted At\n";
            foreach ($scores as $score) {
                if ($s = Student::find($score->student_id)) {
                    $csv .= implode(',', [$s->id, '"'.$s->candidate_no.'"', '"'.$s->full_name.'"', '"'.$s->department.'"', '"'.$s->programme.'"', '"'.$score->course_name.'"', $score->score, $score->created_at ?? 'N/A'])."\n";
                }
            }

            return response($csv, 200, ['Content-Type' => 'text/csv', 'Content-Disposition' => 'attachment; filename="scores.csv"']);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function edit_question(Request $request, $question_Id)
    {
        $q = Question::findOrFail($question_Id);
        $q->update($request->all());

        return response()->json($q);
    }

    public function getQuestionBank($user_id, $course_id)
    {
        return response()->json(Course::findOrFail($course_id)->questionBanks);
    }

    public function getExamQuestionBank($user_id, $exam_id)
    {
        $e = Exam::findOrFail($exam_id);

        return response()->json(Course::findOrFail($e->course_id)->questionBanks, 200);
    }

    public function get_archive_by_exam(Request $request, $exam_id)
    {
        try {
            $a = ExamArchive::with('exam')->where('exam_id', $exam_id)->orderBy('id', 'desc')->first();
            if (! $a) {
                return response()->json(['error' => 'Not found'], 404);
            }
            $user = $request->user();
            if ($user->role === 'level_admin') {
                $res = collect($a->student_results)->filter(function ($r) use ($user) {
                    if (isset($r['level_id'])) {
                        return $r['level_id'] == $user->level_id;
                    }
                    $s = Student::find($r['student_id']);

                    return $s && $s->level_id == $user->level_id;
                })->values()->all();
                $a->student_results = $res;
            } elseif ($user->role === 'faculty_officer') {
                $res = collect($a->student_results)->filter(function ($r) use ($user) {
                    if (isset($r['level_id'])) {
                        $d = Acd_session::find($r['level_id']);

                        return $d && $d->faculty_id == $user->faculty_id;
                    }
                    $s = Student::with('level')->find($r['student_id']);

                    return $s && $s->level && $s->level->faculty_id == $user->faculty_id;
                })->values()->all();
                $a->student_results = $res;
            }

            return response()->json($a);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
