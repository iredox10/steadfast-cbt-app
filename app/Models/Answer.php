<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'candidate_id'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
    public function answer_number($default = 1) // Optional field for multiple answers
    {
        return $this->getAttribute('answer_number') ?? $default;
    }
}
