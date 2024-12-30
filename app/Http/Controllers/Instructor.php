<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\Answers;
use App\Models\Course;
use App\Models\Exam;
use App\Models\LecturerCourse;
use App\Models\Question;
use App\Models\question_bank;
use App\Models\Student;
use App\Models\StudentCourse;
use App\Models\StudentExamScore;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class Instructor extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        try {

            $users = User::all();
            return response()->json($users);
        } catch (Exception $e) {
            return response()->json($e);
        }
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validate = request()->validate([
            'email' => 'required | email | string | max:255',
            'password' => 'required| string | max:255',
            'full_name' => 'required| string | max:255',
            'role' => 'required| string | max:255',
            'status' => 'required| string | max:255'
        ]);
        $validate['password'] = Hash::make($validate['password']);
        try {
            $user = User::create($validate);
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json($e->getMessage());
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
            return response()->json($e);
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
        //
        // $user = User::findOrFail($id);
        // user->email = $validate['email']

        return response()->json($validate);
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

            // ! $question is not an error but a warning
            $questions;
            for ($i = 0; $i < $exam->no_of_questions; $i++) {
                $questions = Question::insert([
                    'exam_id' => $exam->id,
                    'user_id' => $user->id,
                    'serial_number' => $i + 1
                ]);
            }
            return response()->json($exam, 201);
        } catch (\Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function get_exams($user_id, $course_id)
    {
        try {
            // $exams = User::findOrFail($user_id)->exams;
            // $exams = Exam::where(['user_id' => $user_id]);
            $exams = Exam::where('user_id', $user_id)
                ->where('course_id', $course_id)
                ->get();
            return response()->json($exams);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function add_question(Request $request, $question_id, string $user_id, string $exam_id)
    {
        $validate = request()->validate([
            'question' => 'string | required',
            'correct_answer' => 'string | required',
            // 'option_a' => 'string | required',
            'option_b' => 'string | required',
            'option_c' => 'string ',
            'option_d' => 'string ',
        ]);
        try {

            $user = User::findOrFail($user_id);
            $exam = Exam::findOrFail($exam_id);

            $question = Question::findOrFail($question_id);

            $question->question = $validate['question'];
            $question->correct_answer = $validate['correct_answer'];
            // $question->option_a = $validate['option_a'];
            $question->option_b = $validate['option_b'];
            $question->option_c = $validate['option_c'];
            $question->option_d = $validate['option_d'];

            $question->save();

            return response()->json($question, 201);
            // Todo: implement question bank
            // if ($question) {
            //     $question_bank = question_bank::create([
            //         'exam_id' => $question->exam_id,
            //         'user_id' => $question->user_id,
            //         'curl -sS https://getcomposer.org/installer | phpquestion' => $question->question,
            //         'correct_answer' => $question->correct_answer,
            //         'option_a' => $question->option_a,
            //         'option_b' => $question->option_b,
            //         'option_c' => $question->option_c,
            //         'option_d' => $question->option_d,
            //     ]);
            //     return response()->json(data:[$question,$question_bank]);
            // }
        } catch (Exception $e) {
            return response()->json($e->getMessage(), 400);
        }
    }

    public function submitExam(Request $request, $exam_id)
    {
        try {
            // TODO: ask if you should cancel the other submission for any submmissio
            // TODO: Life you so in admin activate_exam controller.

            // Exam::query()->update(['submission_status' => 'not_submitted']);
            $exam = Exam::findOrFail($exam_id);
            $exam->submission_status = 'submitted';
            $exam->save();
            return response()->json($exam);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }
    public function get_exam()
    {
        try {
            $exam = Exam::where('activated', 'yes')->get();
            return response()->json($exam, 200);
        } catch (\Exception $e) {
            return response()->json($e);
        }
    }

    public function get_exam_by_id($exam_id)
    {
        try {
            $exam = Exam::findOrFail($exam_id);
            return response()->json($exam);
        } catch (\Exception $e) {
            return response()->json($e);
        }
    }

    public function delete_exam($exam_id)
    {
        try {
            $exam = Exam::destroy($exam_id);
            return response()->json($exam);
        } catch (\Exception $e) {
            return response()->json($e->getMessage());
        }
    }
    public function get_questions(Request $request, $exam_id)
    {
        $exam = Exam::findOrFail($exam_id)->questions;
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
            $courses = User::findOrFail($user_id)->courses;
            return response()->json($courses);
        } catch (\Exception $err) {
            return response()->json($err->getMessage());
        }
    }


    // public function get_students(Request $request, $user_id, $course_id)
    // {
    //     try {

    //         $students_courses;
    //         $courses;
    //         $student;

    //         $students = Student::all();

    //         $instructor_courses = User::findOrFail($user_id)->courses;

    //         foreach ($students as $course_id => $value) {
    //             $students_courses = Student::findOrFail($value->id)->courses;
    //             // $student = Student::findOrFail($value->id)->courses;
    //         }
    //         foreach ($students_courses as $std) {

    //             return response()->json($std->course_id);
    //         }
    //         // foreach ($students_courses as $std) {
    //         //     if ($std->student_id == $course_id) {
    //         //         $student = Student::findOrFail($std->student_id);
    //         //         return response()->json($student);
    //         //     }
    //         // }

    //         $d;
    //         $c;

    //         foreach ($instructor_courses as $course) {
    //             $c = $course->id;
    //         }
    //         // return response()->json($students_courses);
    //     } catch (\Exception $err) {
    //         return  response()->json($err->getMessage());
    //     }
    // }

    //     public function get_students(Request $request, $user_id, $course_id)
    // {
    //     try {
    //         // Find the instructor and their courses
    //         $instructor_courses = User::findOrFail($user_id)->courses;

    //         // Check if the course_id exists in the instructor's courses
    //         $course = $instructor_courses->where('id', $course_id)->first();

    //         $course_students = $course->students;

    //         if (!$course) {
    //             return response()->json(['message' => 'Course not found for this instructor'], 404);
    //         }

    //         // Retrieve students for the specific course
    //         $students = $course->students; // Assuming the relationship is set up in your Course model

    //         if (!$students) {
    //             return response()->json(['message' => 'No students found for this course'], 404);
    //         }

    //         // Return the students in JSON format
    //         return response()->json($course_students, 200);

    //     } catch (\Exception $err) {
    //         return response()->json(['error' => $err->getMessage()], 500);
    //     }
    // }


    public function get_students(Request $request, $user_id, $course_id)
    {
        try {
            // Find the instructor and their courses
            $instructor_courses = User::findOrFail($user_id)->courses;

            // Check if the course_id exists in the instructor's courses
            // $course = $instructor_courses->where('id', $course_id)->first();
            $course = Course::findOrFail($course_id);

            if (!$course) {
                return response()->json(['message' => 'Course not found for this instructor'], 404);
            }
            // Retrieve students for the specific course
            $students = Course::findOrFail($course_id)->studentCourses;

            $student_list = [];

            foreach ($students as $student) {
                $std = Student::findOrFail($student->student_id);
                $student_list[] = $std;
            }

            if (!$students) {
                return response()->json(['message' => 'No students found for this course'], 404);
            }

            return response()->json($student_list, 200);
        } catch (Exception $err) {
            return response()->json(['error' => $err->getMessage()], 500);
        }
    }

    public function student_submit_exam($course_id, $candidate_id)
    {
        try {
            $score = Answers::where('course_id', $course_id)->where('candidate_id', $candidate_id)->where('is_correct', true)->count();
            $course = Course::findOrFail($course_id);
            $exam = StudentExamScore::updateOrCreate(
                [
                    'student_id' => $candidate_id, // Condition for finding  
                    'course_id' => $course_id               // Condition for finding  
                ],
                [
                    'score' => $score,                       // Attributes to update or create  
                    'course_name' => $course->title
                ]
            );
            return response()->json(['score' => $score, 'exam' => $exam]);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }
    public function get_students_score($course_id)
    {
        try {
            $scores = StudentExamScore::where('course_id', $course_id)->get();
            return response()->json($scores);
        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }
    }
    public function edit_question(Request $request, $question_Id)
    {
        $question = Question::where('id', $question_Id)->update(
            [
                'question' => $request->question,
                'correct_answer' => $request->correct_answer,
                'option_b' => $request->option_b,
                'option_c' => $request->option_c,
                'option_d' => $request->option_d
            ]
        );
        return response()->json($question, 201);
    }
}
