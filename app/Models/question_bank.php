<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class question_bank extends Model
{
    use HasFactory;

     public function exams() // Many-to-many relationship with exams
    {
        return $this->belongsToMany(Exam::class, 'tbl_question_exam'); // Define the pivot table
    }

    // public function answers() // One-to-many relationship with possible answers
    // {
    //     return $this->hasMany(::class);
    // }
}
