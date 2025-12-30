<?php

namespace App\Imports;

use App\Models\Candidate;
use App\Models\Student;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class StudentsImport implements ToCollection
{
    private $level_id;

    public function __construct($level_id = null)
    {
        $this->level_id = $level_id;
    }

    /**
     * @param Collection $rows
     */
    public function collection(Collection $rows)
    {
        // Skip the header (row[0] is usually the column headers)
        foreach ($rows as $index => $row) {
            if ($index == 0) continue; // Skip the first row

            if (empty($row[0])) continue; // Skip empty rows

            // Check if student already exists
            if (Student::where('candidate_no', $row[0])->exists()) continue;

            Student::create([
                'candidate_no' => $row[0],
                'full_name' => $row[1],
                'programme' => $row[2],
                'department' => $row[3],
                'password' => bcrypt($row[4] ?? 'password'), 
                'is_logged_on' => 'no',
                'checkin_time' => null,
                'level_id' => $this->level_id
            ]);
        }
    }
}
