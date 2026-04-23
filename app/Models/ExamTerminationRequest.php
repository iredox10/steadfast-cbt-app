<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamTerminationRequest extends Model
{
    protected $table = 'exam_termination_requests';

    protected $fillable = [
        'exam_id',
        'requested_by',
        'request_reason',
        'status',
        'reviewed_by',
        'review_reason',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
