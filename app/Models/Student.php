<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'candidate_no',
        'full_name',
        'programme',
        'department',
        'password',
        'is_logged_on',
        'checkin_time',
        'checkout_time'
    ];

    protected $hidden = [
        'password'
    ];

    public function courses()
    {
        return $this->hasMany(StudentCourse::class);
    }
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

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

    /**
     * Get the candidates for the student.
     */
    public function candidates()
    {
        return $this->hasMany(Candidate::class, 'student_id');
    }
}
