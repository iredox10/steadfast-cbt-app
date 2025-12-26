<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LecturerCourse extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'course_id',
        'title',
        'code',
        'credit_unit',
        'status',
        'created_by'
    ];

    public function courses(){
        return $this->belongsTo(User::class, 'user_id');
    }

    public function user(){
        return $this->belongsTo(User::class, 'user_id');
    }
}
