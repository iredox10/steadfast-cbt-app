<?php

namespace App\Imports;

use App\Models\Candidate;
use App\Models\Student;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class StudentsImport implements ToCollection
{
    /**
     * @param Collection $rows
     */
    public function collection(Collection $rows)
    {
        // Skip the header (row[0] is usually the column headers)
        foreach ($rows as $index => $row) {
            if ($index == 0) continue; // Skip the first row

            // Assuming the columns in Excel are: name, email, and password
            Student::create([
                'candidate_no' => $row[0],
                'full_name' => $row[1],
                'programme' => $row[2],
                'department' => $row[3],
                'password' => bcrypt($row[4]), // Hash password
                'is_logged_on' => 'no',          // Default value for is_logged_on
                'checkin_time' => null,
                // 'checkout_time' => 'null',
            ]);
        }
    }
}
