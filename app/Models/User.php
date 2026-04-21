<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'email',
        'password',
        'full_name',
        'role',
        'status',
        'level_id',
        'faculty_id',
        'force_password_change',
    ];

    public function level(){
        return $this->belongsTo(Acd_session::class, 'level_id');
    }

    public function faculty(){
        return $this->belongsTo(Faculty::class);
    }

    public function courses(){
        return $this->hasMany(LecturerCourse::class);
    }

    public function exams() {
        return $this->hasMany(Exam::class);
    }
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'force_password_change' => 'boolean',
        ];
    }

}
