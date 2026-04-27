<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;
    protected $fillable = [
        'course_id',
        'user_id',
        'level_id',
        'exam_type',
        'instructions',
        'max_score',
        'marks_per_question',
        'no_of_questions',
        'actual_questions',
        'exam_duration',
        'invigilator',
        'submission_status',
        'submission_count',
        'submission_date',
        'activated_date',
        'timer_mode',
        'timer_start_type',
        'scheduled_start_time',
        'start_time',
        'finished_time',
        'finished',
        'activated',
        // Security settings
        'enable_browser_lockdown',
        'enable_fullscreen',
        'enable_copy_paste_block',
        'enable_screenshot_block',
        'enable_tab_switch_detection',
        'enable_multiple_monitor_check',
        'max_violations',
        'activated_by',
        'terminated_by',
        'termination_reason',
    ];

    public function level()
    {
        return $this->belongsTo(Acd_session::class, 'level_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function activator()
    {
        return $this->belongsTo(User::class, 'activated_by');
    }

    public function terminator()
    {
        return $this->belongsTo(User::class, 'terminated_by');
    }

    public function terminationRequests()
    {
        return $this->hasMany(ExamTerminationRequest::class);
    }

    public function pendingTerminationRequest()
    {
        return $this->hasOne(ExamTerminationRequest::class)->where('status', 'pending');
    }
    public function student() {
        return $this->hasMany(Student::class);
    }
    public function questions(){
        return $this->hasMany(Question::class);
    }
    
    /**
     * Get the tickets for this exam.
     */
    public function tickets()
    {
        return $this->hasMany(ExamTicket::class);
    }

    /**
     * Get the violations for this exam.
     */
    public function violations()
    {
        return $this->hasMany(ExamViolation::class);
    }

    /**
     * Check if browser lockdown is enabled for this exam.
     */
    public function hasSecurityEnabled($feature = null)
    {
        if (!$this->enable_browser_lockdown) {
            return false;
        }

        if ($feature === null) {
            return true;
        }

        $featureColumn = 'enable_' . $feature;
        return $this->$featureColumn ?? false;
    }

    /**
     * Get all enabled security features for this exam.
     */
    public function getEnabledSecurityFeatures()
    {
        if (!$this->enable_browser_lockdown) {
            return [];
        }

        $features = [];
        if ($this->enable_fullscreen) $features[] = 'fullscreen';
        if ($this->enable_copy_paste_block) $features[] = 'copy_paste_block';
        if ($this->enable_screenshot_block) $features[] = 'screenshot_block';
        if ($this->enable_tab_switch_detection) $features[] = 'tab_switch_detection';
        if ($this->enable_multiple_monitor_check) $features[] = 'multiple_monitor_check';

        return $features;
    }
}
