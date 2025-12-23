<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    protected $fillable = ['name', 'code', 'description'];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function departments()
    {
        return $this->hasMany(Acd_session::class);
    }
}
