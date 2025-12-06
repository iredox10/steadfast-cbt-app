<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamTicket extends Model
{
    use HasFactory;

    protected $dateFormat = 'Y-m-d H:i:s';

    protected $fillable = [
        'exam_id',
        'ticket_no',
        'is_used',
        'assigned_to_student_id',
        'assigned_at',
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'assigned_at' => 'datetime',
    ];

    /**
     * Get the exam that owns this ticket.
     */
    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * Get the student assigned to this ticket.
     */
    public function student()
    {
        return $this->belongsTo(Student::class, 'assigned_to_student_id');
    }

    /**
     * Assign this ticket to a student.
     */
    public function assignToStudent($studentId)
    {
        $this->is_used = true;
        $this->assigned_to_student_id = $studentId;
        $this->assigned_at = now();
        $this->save();
    }

    /**
     * Check if ticket is available for use.
     */
    public function isAvailable()
    {
        return !$this->is_used;
    }

    /**
     * Check if ticket is assigned to a specific student.
     */
    public function isAssignedTo($studentId)
    {
        return $this->assigned_to_student_id == $studentId;
    }

    /**
     * Generate a unique ticket number.
     */
    public static function generateUniqueTicketNumber($examId)
    {
        do {
            $ticketNo = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (self::where('exam_id', $examId)->where('ticket_no', $ticketNo)->exists());

        return $ticketNo;
    }

    /**
     * Scope for available tickets.
     */
    public function scopeAvailable($query, $examId)
    {
        return $query->where('exam_id', $examId)->where('is_used', false);
    }

    /**
     * Scope for used tickets.
     */
    public function scopeUsed($query, $examId)
    {
        return $query->where('exam_id', $examId)->where('is_used', true);
    }
}
