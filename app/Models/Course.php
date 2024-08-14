<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'acd_session_id',
        'semester',
        'status'
    ];

    public function acSession()
    {
        return $this->belongsTo(Acd_Session::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }
}
