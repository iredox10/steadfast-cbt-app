
<?php

namespace App\Imports;

use App\Models\Candidate;
use App\Models\User;
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
            Candidate::create([
                'candidate_no' => $row[0],
                'full_name' => $row[2],
                'programme' => $row[3],
                'department' => $row[4],
                'password' => bcrypt($row[5]), // Hash password
                'image' => $row[6],
            ]);
        }
    }
}
