<?php

namespace App\Imports;

use App\Models\Faculty;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class FacultiesImport implements ToCollection
{
    /**
     * @param Collection $rows
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            if ($index == 0) continue; // Skip header

            if (empty($row[0]) || empty($row[1])) {
                continue;
            }

            // Check if faculty already exists by code
            if (Faculty::where('code', $row[1])->exists()) {
                continue;
            }

            Faculty::create([
                'name' => $row[0],
                'code' => $row[1],
                'description' => $row[2] ?? null,
            ]);
        }
    }
}
