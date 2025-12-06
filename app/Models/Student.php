<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $dateFormat = 'Y-m-d H:i:s';

    protected $fillable = [
        'candidate_no',
        'full_name',
        'programme',
        'department',
        'password',
        'image',
        'is_logged_on',
        'is_checked_in',
        'checkin_time',
        'checkout_time',
        'level_id'
    ];

    protected $hidden = [
        'password'
    ];

    public function level()
    {
        return $this->belongsTo(Acd_session::class, 'level_id');
    }

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

    /**
     * Get the exam scores for the student.
     */
    public function examScores()
    {
        return $this->hasMany(StudentExamScore::class);
    }
}
