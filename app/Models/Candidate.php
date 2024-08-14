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
        'password',
        'is_checkout',
        'is_checkout',
        'checkin_time',
        'checkout_time'
    ];
    public function semester() // New relationship
    {
        return $this->belongsTo(Semester::class);
    }


    public function courses() // Existing relationship
    {
        return $this->hasMany(Course::class);
    }
}
