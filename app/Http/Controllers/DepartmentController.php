<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Acd_session;
use App\Models\User;
use App\Models\Student;
use App\Models\Course;
use App\Models\Exam;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class DepartmentController extends Controller
{
    /**
     * Get all departments (for REST API)
     * Filter out academic sessions - only return actual departments
     */
    public function index(Request $request)
    {
        try {
            // Filter to get only departments (not academic sessions)
            // Departments have either head_of_department OR title that doesn't match "YYYY/YYYY" format
            $query = Acd_session::where(function($q) {
                $q->whereNotNull('head_of_department')
                      ->orWhereNotNull('contact_email')
                      ->orWhereNotNull('contact_phone')
                      ->orWhere('title', 'NOT LIKE', '%/%');
            });

            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $departments = $query->orderBy('title')->get();
            
            return response()->json($departments, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a new department (for REST API)
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255|unique:acd_sessions,title',
                'description' => 'nullable|string',
                'head_of_department' => 'nullable|string|max:255',
                'contact_email' => 'nullable|email|max:255',
                'contact_phone' => 'nullable|string|max:20'
            ]);

            $department = Acd_session::create([
                'title' => $request->title,
                'description' => $request->description,
                'head_of_department' => $request->head_of_department,
                'contact_email' => $request->contact_email,
                'contact_phone' => $request->contact_phone,
                'status' => 'active'
            ]);

            return response()->json([
                'message' => 'Department created successfully',
                'department' => $department
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Show a specific department (for REST API)
     */
    public function show($id)
    {
        try {
            $department = Acd_session::findOrFail($id);
            return response()->json($department, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Department not found'], 404);
        }
    }

    /**
     * Update a department (for REST API)
     */
    public function update(Request $request, $id)
    {
        try {
            $department = Acd_session::findOrFail($id);
            
            $request->validate([
                'title' => 'required|string|max:255|unique:acd_sessions,title,' . $id,
                'description' => 'nullable|string',
                'head_of_department' => 'nullable|string|max:255',
                'contact_email' => 'nullable|email|max:255',
                'contact_phone' => 'nullable|string|max:20'
            ]);

            $department->update([
                'title' => $request->title,
                'description' => $request->description,
                'head_of_department' => $request->head_of_department,
                'contact_email' => $request->contact_email,
                'contact_phone' => $request->contact_phone,
            ]);

            return response()->json([
                'message' => 'Department updated successfully',
                'department' => $department
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a department (for REST API)
     */
    public function destroy($id)
    {
        try {
            $department = Acd_session::findOrFail($id);
            
            // Check if department has any associated students or users
            $hasStudents = $department->students()->exists();
            $hasUsers = $department->users()->exists();
            
            if ($hasStudents || $hasUsers) {
                return response()->json([
                    'error' => 'Cannot delete department. It has associated students or users.'
                ], 400);
            }

            $department->delete();
            
            return response()->json([
                'message' => 'Department deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Toggle department status (for REST API)
     */
    public function toggleStatus($id)
    {
        try {
            $department = Acd_session::findOrFail($id);
            $department->status = $department->status === 'active' ? 'inactive' : 'active';
            $department->save();

            return response()->json([
                'message' => 'Department status updated successfully',
                'department' => $department
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get all departments
     */
    public function getDepartments()
    {
        try {
            $departments = Acd_session::withCount([
                'users',
                'students', 
                'courses',
                'exams'
            ])->orderBy('title')->get();

            return response()->json([
                'success' => true,
                'departments' => $departments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch departments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get department by ID with detailed stats
     */
    public function getDepartment($id)
    {
        try {
            $department = Acd_session::with([
                'users:id,full_name,email,role,level_id,status',
                'students:id,full_name,email,level_id,status',
                'courses:id,title,code,level_id,status',
                'exams:id,title,level_id,status,created_at'
            ])->findOrFail($id);

            // Get additional statistics
            $stats = [
                'total_users' => $department->users->count(),
                'total_students' => $department->students->count(),
                'total_courses' => $department->courses->count(),
                'total_exams' => $department->exams->count(),
                'active_admins' => $department->users->where('role', 'level_admin')->count(),
                'active_lecturers' => $department->users->where('role', 'lecturer')->count(),
                'active_students' => $department->students->where('status', 'active')->count(),
                'active_courses' => $department->courses->where('status', 'active')->count(),
                'recent_exams' => $department->exams->sortByDesc('created_at')->take(5)->values()
            ];

            return response()->json([
                'success' => true,
                'department' => $department,
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create a new department
     */
    public function createDepartment(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255|unique:acd_sessions,title',
                'description' => 'nullable|string',
                'department_code' => 'required|string|max:10|unique:acd_sessions,department_code',
                'status' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $department = Acd_session::create([
                'title' => $request->title,
                'description' => $request->description,
                'department_code' => strtoupper($request->department_code),
                'status' => $request->status ?? true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Department created successfully',
                'department' => $department
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update department
     */
    public function updateDepartment(Request $request, $id)
    {
        try {
            $department = Acd_session::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255|unique:acd_sessions,title,' . $id,
                'description' => 'nullable|string',
                'department_code' => 'required|string|max:10|unique:acd_sessions,department_code,' . $id,
                'status' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $department->update([
                'title' => $request->title,
                'description' => $request->description,
                'department_code' => strtoupper($request->department_code),
                'status' => $request->status ?? $department->status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Department updated successfully',
                'department' => $department
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete department (soft delete by setting status to false)
     */
    public function deleteDepartment($id)
    {
        try {
            $department = Acd_session::findOrFail($id);

            // Check if department has associated data
            $hasUsers = $department->users()->count() > 0;
            $hasStudents = $department->students()->count() > 0;
            $hasCourses = $department->courses()->count() > 0;

            if ($hasUsers || $hasStudents || $hasCourses) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete department. It has associated users, students, or courses. Please transfer them to another department first.'
                ], 400);
            }

            $department->delete();

            return response()->json([
                'success' => true,
                'message' => 'Department deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get department dashboard stats
     */
    public function getDepartmentDashboard($departmentId)
    {
        try {
            $department = Acd_session::findOrFail($departmentId);

            $stats = [
                'department_info' => [
                    'id' => $department->id,
                    'title' => $department->title,
                    'code' => $department->department_code,
                    'description' => $department->description
                ],
                'counts' => [
                    'total_users' => $department->users()->count(),
                    'total_students' => $department->students()->count(),
                    'total_courses' => $department->courses()->count(),
                    'total_exams' => $department->exams()->count(),
                    'level_admins' => $department->users()->where('role', 'level_admin')->count(),
                    'lecturers' => $department->users()->where('role', 'lecturer')->count(),
                    'active_students' => $department->students()->where('status', 'active')->count(),
                    'active_courses' => $department->courses()->where('status', 'active')->count()
                ],
                'recent_activities' => [
                    'recent_users' => $department->users()->latest()->take(5)->get(['id', 'full_name', 'role', 'created_at']),
                    'recent_students' => $department->students()->latest()->take(5)->get(['id', 'full_name', 'created_at']),
                    'recent_exams' => $department->exams()->latest()->take(5)->get(['id', 'title', 'created_at'])
                ]
            ];

            return response()->json([
                'success' => true,
                'dashboard' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch department dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle department status
     */
    public function toggleDepartmentStatus($id)
    {
        try {
            $department = Acd_session::findOrFail($id);
            $department->status = !$department->status;
            $department->save();

            return response()->json([
                'success' => true,
                'message' => 'Department status updated successfully',
                'department' => $department
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update department status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle instructor enrollment permission
     */
    public function toggleEnrollment(Request $request, $id)
    {
        try {
            $department = Acd_session::findOrFail($id);
            
            $request->validate([
                'allow_instructor_enrollment' => 'required|boolean'
            ]);

            $department->allow_instructor_enrollment = $request->allow_instructor_enrollment;
            $department->save();

            return response()->json([
                'success' => true,
                'message' => 'Enrollment permission updated successfully',
                'department' => $department
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update enrollment permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
