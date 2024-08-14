<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Acd_session extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'status'
    ];

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function semesters()
    {
        return $this->hasMany(Semester::class);
    }
}
