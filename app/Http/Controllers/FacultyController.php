<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\FacultiesImport;

class FacultyController extends Controller
{
    /**
     * Download sample import file for faculties
     */
    public function downloadSampleImportFile()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="sample_faculties_import.csv"',
        ];

        $columns = ['Name', 'Code', 'Description'];
        $sampleData = [
            ['Faculty of Science', 'FSC', 'Natural and physical sciences'],
            ['Faculty of Arts', 'ART', 'Humanities and creative arts'],
        ];

        $callback = function () use ($columns, $sampleData) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($sampleData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Import faculties from Excel
     */
    public function importFaculties(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|mimes:xlsx,xls,csv',
            ]);

            Excel::import(new FacultiesImport, $request->file('file'));

            return response()->json([
                'message' => 'Faculties imported successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to import faculties',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $faculties = \App\Models\Faculty::with(['users' => function($query) {
            $query->where('role', 'faculty_officer');
        }])->withCount(['departments', 'users'])->get();
        return response()->json($faculties);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validate = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:faculties,code',
            'description' => 'nullable|string'
        ]);

        $faculty = \App\Models\Faculty::create($validate);
        return response()->json($faculty, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $faculty = \App\Models\Faculty::with(['departments', 'users'])->findOrFail($id);
        return response()->json($faculty);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $faculty = \App\Models\Faculty::findOrFail($id);
        
        $validate = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:faculties,code,' . $id,
            'description' => 'nullable|string'
        ]);

        $faculty->update($validate);
        return response()->json($faculty);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $faculty = \App\Models\Faculty::findOrFail($id);
        $faculty->delete();
        return response()->json(['message' => 'Faculty deleted successfully']);
    }

    /**
     * Get faculty officers for a specific faculty
     */
    public function getFacultyOfficers($id)
    {
        $officers = \App\Models\User::where('role', 'faculty_officer')
            ->where('faculty_id', $id)
            ->get();
        return response()->json($officers);
    }
}
