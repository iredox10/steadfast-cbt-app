<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;
    protected $fillable = [
        'course_id',
        'user_id',
        'exam_type',
        'instructions',
        'max_score',
        'marks_per_question',
        'no_of_questions',
        'actual_questions',
        'exam_duration',
        'invigilator',
        'submission_status',
        'submission_date',
        'activated_date',
        'start_time',
        'finished',
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }
    public function student() {
        return $this->hasMany(Student::class);
    }
    public function questions(){
        return $this->hasMany(Question::class);
    }
}
