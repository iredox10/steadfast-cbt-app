<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }

    public function lecturer() // Optional relationship (one-to-many)
    {
        return $this->belongsTo(Student::class, 'lecturer_id'); // Specify foreign key name
    }

    public function mentees() // Optional relationship (one-to-many)
    {
        return $this->hasMany(Student::class, 'lecturer_id'); // Specify foreign key name
    }
}
