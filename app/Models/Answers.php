<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answers extends Model
{
    use HasFactory;
    protected $fillable = [
        'candidate_id',
        'question_id',
        'question',
        'choice',
        'is_correct',
        'answered',
        'course_id'
    ];

    public function candidate()
    {
        return $this->belongsTo(Student::class);
    }
}
