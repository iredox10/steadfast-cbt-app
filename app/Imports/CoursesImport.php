<?php

namespace App\Imports;

use App\Models\Course;
use App\Models\Semester;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class CoursesImport implements ToCollection
{
    protected $sessionId;
    protected $semesterId;

    public function __construct($sessionId, $semesterId = null)
    {
        $this->sessionId = $sessionId;
        $this->semesterId = $semesterId;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            if ($index == 0) continue; // Skip header

            // Row structure: Code, Title, Credit Unit, [Semester - optional if semesterId provided]
            $code = $row[0];
            $title = $row[1];
            $creditUnit = $row[2];
            $semesterInput = isset($row[3]) ? $row[3] : null;

            if (empty($code) || empty($title)) continue;

            $semester = null;

            // If specific semester ID is provided (from Semester page), use it directly
            if ($this->semesterId) {
                $semester = Semester::find($this->semesterId);
            } 
            // Otherwise try to find by name from Excel column
            else if ($semesterInput) {
                $semester = Semester::where('acd_session_id', $this->sessionId)
                    ->where(function($query) use ($semesterInput) {
                        $query->where('title', 'like', '%' . $semesterInput . '%')
                              ->orWhere('semester', 'like', '%' . $semesterInput . '%');
                    })
                    ->first();
            }

            // If semester still not found and no specific semester target, fallback to first
            if (!$semester && !$this->semesterId) {
                $semester = Semester::where('acd_session_id', $this->sessionId)->first();
            }

            if ($semester) {
                Course::updateOrCreate(
                    [
                        'code' => $code,
                        'acd_session_id' => $this->sessionId
                    ],
                    [
                        'title' => $title,
                        'credit_unit' => intval($creditUnit),
                        'semester_id' => $semester->id
                    ]
                );
            }
        }
    }
}
