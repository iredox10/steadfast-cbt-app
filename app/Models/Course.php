<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'semester_id',
        'acd_session_id',
        'code',
        'title',
        'credit_unit',
        'created_by'
    ];

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function acdSession()
    {
        return $this->belongsTo(Acd_session::class, 'acd_session_id');
    }

    // public function students (){
    //     return $this->belongsToMany(StudentCourse::class);
    // }

    public function studentCourses()
    {
        return $this->hasMany(StudentCourse::class);
    }


    public function exam()
    {
        return $this->hasMany(Exam::class);
    }

    public function questionBanks()
    {
        return $this->hasMany(QuestionBank::class);
    }

    public function lecturerCourses()
    {
        return $this->hasMany(LecturerCourse::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
