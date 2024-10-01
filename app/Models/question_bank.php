<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class question_bank extends Model
{
    use HasFactory;
    protected $fillable = [
        'question_id',
        'exam_id',
        'question',
        'correct_answer',
        'option_a',
        'option_b',
        'option_c',
        'option_d',
    ];
    public function exams() // Many-to-many relationship with exams
    {
        return $this->hasMany(Exam::class); // Define the pivot table
    }

    // public function answers() // One-to-many relationship with possible answers
    // {
    //     return $this->hasMany(::class);
    // }
}
