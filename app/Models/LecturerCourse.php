<?php

namespace App\Models;

use App\Http\Controllers\Instructor;
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
        'credit_unit'
    ];

    public function courses(){
        return $this->belongsTo(User::class);
    }
}
