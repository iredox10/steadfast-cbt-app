<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Illuminate\Support\Facades\Hash;

class AdminsImport implements ToCollection
{
    /**
     * @param Collection $rows
     */
    public function collection(Collection $rows)
    {
        // Skip the header (row[0] is usually the column headers)
        foreach ($rows as $index => $row) {
            if ($index == 0) continue; // Skip the first row

            // Validate required fields (basic check)
            if (empty($row[0]) || empty($row[1]) || empty($row[2])) {
                continue;
            }

            // Check if user already exists
            if (User::where('email', $row[1])->exists()) {
                continue;
            }

            User::create([
                'full_name' => $row[0],
                'email' => $row[1],
                'role' => $row[2],
                'level_id' => isset($row[3]) ? $row[3] : null,
                'password' => Hash::make('password'), // Default password
                'status' => 'active',
            ]);
        }
    }
}
