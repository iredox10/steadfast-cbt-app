<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentExamScore extends Model
{
    use HasFactory;
    protected $fillable = ['course_id', 'student_id', 'score', 'course_name'];


    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }
}
