<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'programme',
        'department',
        'image',
        'password',
        'is_checkout',
        'is_checkout',
        'is_logged_on',
        'checkin_time',
        'checkout_time',
        'exam_id',
        'student_id',
        'score',
    ];
    public function semester() // New relationship
    {
        return $this->belongsTo(Semester::class);
    }


    public function courses() // Existing relationship
    {
        return $this->hasMany(Course::class);
    }

    /**
     * Get the student that owns the candidate record.
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
