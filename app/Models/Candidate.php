<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    use HasFactory;

    protected $dateFormat = 'Y-m-d H:i:s';

    protected $fillable = [
        'full_name',
        'programme',
        'department',
        'image',
        'password',
        'is_checkout',
        'is_logged_on',
        'is_checked_in',
        'checkin_time',
        'checkout_time',
        'exam_id',
        'student_id',
        'score',
        'ticket_no',
        'status',
        'time_extension',
        'start_time',
    ];

    protected $casts = [
        'start_time' => 'datetime',
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

    /**
     * Get the exam that the candidate belongs to.
     */
    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }
}
