<?php

namespace App\Imports;

use App\Models\Course;
use App\Models\Semester;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class CoursesImport implements ToCollection
{
    protected $sessionId;

    public function __construct($sessionId)
    {
        $this->sessionId = $sessionId;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            if ($index == 0) continue; // Skip header

            // Row structure: Code, Title, Credit Unit, Semester
            $code = $row[0];
            $title = $row[1];
            $creditUnit = $row[2];
            $semesterInput = $row[3];

            if (empty($code) || empty($title)) continue;

            // Find semester
            $semester = Semester::where('acd_session_id', $this->sessionId)
                ->where(function($query) use ($semesterInput) {
                    $query->where('title', 'like', '%' . $semesterInput . '%')
                          ->orWhere('semester', 'like', '%' . $semesterInput . '%');
                })
                ->first();

            // If semester not found, fallback to the first semester of the session
            if (!$semester) {
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
