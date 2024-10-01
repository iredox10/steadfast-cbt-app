<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Semester extends Model
{
    use HasFactory;

    protected $fillable = [
        'acd_session_id',
        'semester',
        'status'
    ];

    public function acd_session()
    {
        return $this->belongsTo(Acd_Session::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
