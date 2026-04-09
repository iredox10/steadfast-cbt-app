<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = ['user_id', 'type', 'message'];

    public static function log($type, $message, $userId = null)
    {
        if (! $userId && auth()->check()) {
            $userId = auth()->id();
        }

        self::create([
            'user_id' => $userId,
            'type' => $type,
            'message' => $message,
        ]);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
