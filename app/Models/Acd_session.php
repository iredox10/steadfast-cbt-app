<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Acd_session extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'status',
        'description',
        'department_code',
        'head_of_department',
        'contact_email',
        'contact_phone'
    ];

    protected $casts = [
        'status' => 'boolean'
    ];

    // Relationships
    public function courses()
    {
        return $this->hasMany(Course::class, 'level_id');
    }

    public function semesters()
    {
        return $this->hasMany(Semester::class, 'level_id');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'level_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'level_id');
    }

    public function exams()
    {
        return $this->hasMany(Exam::class, 'level_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    // Helper methods
    public function getDepartmentStatsAttribute()
    {
        return [
            'total_users' => $this->users()->count(),
            'total_students' => $this->students()->count(),
            'total_courses' => $this->courses()->count(),
            'total_exams' => $this->exams()->count(),
            'active_admins' => $this->users()->where('role', 'level_admin')->count(),
            'active_lecturers' => $this->users()->where('role', 'lecturer')->count(),
        ];
    }
}
