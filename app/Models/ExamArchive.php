<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamArchive extends Model
{
    protected $fillable = [
        'exam_id',
        'exam_title',
        'course_title',
        'exam_date',
        'duration',
        'total_questions',
        'marks_per_question',
        'total_marks',
        'student_results',
        'activated_by_name',
        'terminated_by_name'
    ];

    protected $casts = [
        'student_results' => 'array',
        'exam_date' => 'datetime'
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }
} 