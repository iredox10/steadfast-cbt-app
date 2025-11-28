<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Student;
use App\Models\Exam;

class ExamViolation extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'exam_id',
        'violation_type',
        'details',
        'violated_at'
    ];

    protected $casts = [
        'violated_at' => 'datetime',
        'details' => 'array'
    ];

    /**
     * Get the student that committed the violation.
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the exam where the violation occurred.
     */
    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * Scope to filter by violation type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('violation_type', $type);
    }

    /**
     * Scope to filter by student.
     */
    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope to filter by exam.
     */
    public function scopeForExam($query, $examId)
    {
        return $query->where('exam_id', $examId);
    }

    /**
     * Get violation count for a specific student in an exam.
     */
    public static function getViolationCount($studentId, $examId)
    {
        return static::where('student_id', $studentId)
            ->where('exam_id', $examId)
            ->count();
    }
}
