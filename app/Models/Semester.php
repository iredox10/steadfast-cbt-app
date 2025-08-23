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
        'title',
        'status',
        'created_by'
    ];

    public function acd_session()
    {
        return $this->belongsTo(Acd_session::class);
    }

    public function acdSession()
    {
        return $this->belongsTo(Acd_session::class, 'acd_session_id');
    }

    // Accessor to get title attribute (use semester field if title is not set)
    public function getTitleAttribute($value)
    {
        return $value ?: $this->semester;
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
