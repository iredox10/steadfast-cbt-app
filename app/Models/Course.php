<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'semester_id',
        'code',
        'title',
        'credit_unit'
    ];

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function exam (){
        return $this->hasMany(Exam::class);
    }
}
