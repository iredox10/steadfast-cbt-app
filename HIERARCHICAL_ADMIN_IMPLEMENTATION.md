# Hierarchical Admin System Implementation

## Overview

This document outlines the implementation of a hierarchical admin system for the CBT (Computer-Based Testing) application. The system provides different levels of administrative access with proper isolation between academic levels.

## Admin Role Hierarchy

### 1. Super Admin
- **Access**: Full system access across all academic levels
- **Capabilities**:
  - Create and manage other administrators (Super Admins and Level Admins)
  - View and manage students, instructors, and exams across all levels
  - Access all academic sessions and levels
  - Full system configuration and settings access

### 2. Level Admin
- **Access**: Limited to their assigned academic level/session
- **Capabilities**:
  - Create and manage Level Admins within their level
  - View and manage students, instructors, and exams only within their assigned level
  - Cannot see or access resources from other academic levels
  - Limited administrative functions within their scope

### 3. Regular Admin (Legacy)
- **Access**: Backward compatibility with existing admin functionality
- **Capabilities**: Same as before implementation for compatibility

## Database Schema Changes

### New Migrations Created:
1. `add_admin_levels_to_users_table` - Adds level hierarchy to users
2. `add_level_id_to_students_table` - Associates students with academic levels
3. `add_level_id_to_exams_table` - Associates exams with academic levels

### Schema Updates:
```sql
-- Users table
ALTER TABLE users ADD COLUMN level_id INTEGER REFERENCES acd_sessions(id);
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50);
-- Added 'super_admin' and 'level_admin' to role enum

-- Students table  
ALTER TABLE students ADD COLUMN level_id INTEGER REFERENCES acd_sessions(id);

-- Exams table
ALTER TABLE exams ADD COLUMN level_id INTEGER REFERENCES acd_sessions(id);
```

## Backend Implementation

### Controllers Enhanced:

#### Admin Controller (`app/Http/Controllers/Admin.php`)
**New Methods Added:**
- `createSuperAdmin()` - Creates super admin users
- `createLevelAdmin()` - Creates level admin users with level assignment
- `getStudentsByLevel()` - Retrieves students filtered by admin level
- `getExamsByLevel()` - Retrieves exams filtered by admin level  
- `getUsersByLevel()` - Retrieves users filtered by admin level
- `getAdminLevelFilter()` - Helper method for level filtering
- `canAccessLevel()` - Authorization helper method

#### Student Controller (`app/Http/Controllers/Student.php`)
**Enhanced Methods:**
- `index()` - Now supports level-based filtering

#### Updated Student Registration:
- `register_student()` method now automatically assigns level_id based on admin's level

### Middleware Created:

#### AdminLevelAccess (`app/Http/Middleware/AdminLevelAccess.php`)
- Enforces level-based access control
- Automatically adds `admin_level_id` to requests for Level Admins
- Allows full access for Super Admins
- Maintains backward compatibility for regular admins

### API Routes Enhanced:

```php
// New hierarchical admin routes
Route::post('/create-super-admin', [Admin::class, 'createSuperAdmin'])->middleware(['auth:sanctum', 'admin.level']);
Route::post('/create-level-admin', [Admin::class, 'createLevelAdmin'])->middleware(['auth:sanctum', 'admin.level']);
Route::get('/students-by-level', [Admin::class, 'getStudentsByLevel'])->middleware(['auth:sanctum', 'admin.level']);
Route::get('/exams-by-level', [Admin::class, 'getExamsByLevel'])->middleware(['auth:sanctum', 'admin.level']);
Route::get('/users-by-level', [Admin::class, 'getUsersByLevel'])->middleware(['auth:sanctum', 'admin.level']);

// Enhanced existing routes with level protection
Route::get('/get-students', [Student::class, 'index'])->middleware(['auth:sanctum', 'admin.level']);
Route::post('/register-student/{user_id}', [Admin::class, 'register_student'])->middleware(['auth:sanctum', 'admin.level']);
```

## Frontend Implementation

### New Components:

#### 1. AdminManagement (`/pages/admin/AdminManagement.jsx`)
- Interface for creating and managing administrators
- Role-based form fields (Super Admin creation only available to Super Admins)
- Academic session assignment for Level Admins
- List view of all administrators with role indicators

#### 2. SuperAdminDashboard (`/pages/admin/SuperAdminDashboard.jsx`) 
- Comprehensive dashboard for both Super Admin and Level Admin roles
- Level-specific statistics for Super Admins
- Quick action cards with role-appropriate options
- Level selector for Super Admin to filter data

#### 3. LevelSelector (`/components/LevelSelector.jsx`)
- Reusable component for academic level selection
- Automatically filters available levels based on user role
- Shows all levels for Super Admin, only assigned level for Level Admin

#### 4. Enhanced AdminSidebar (`/components/AdminSidebar.jsx`)
- Role-aware navigation menu
- Shows appropriate menu items based on user role
- Displays user role and assigned level information
- Dynamic role icons (Crown for Super Admin, Shield for Level Admin)

### Enhanced Existing Components:

#### AdminStudents (`/pages/admin/AdminStudents.jsx`)
- Added level-based filtering
- Level selector for Super Admin
- Level column display for Super Admin view
- Automatic level assignment for new student registration
- Enhanced sidebar integration

#### AdminDashboard (`/pages/admin/AdminDashboard.jsx`)
- Automatic redirection to new hierarchical dashboard for Super/Level Admins
- Maintains backward compatibility for regular admins

### New Routes Added:
```jsx
<Route path="/admin-management" element={<AdminManagement />} />
<Route path="/admin-dashboard/:userId" element={<SuperAdminDashboard />} />
```

## Features Implemented

### Access Control:
- **Super Admin**: Can see and manage everything across all levels
- **Level Admin**: Can only see and manage resources within their assigned academic level
- **Resource Isolation**: Complete separation between different academic levels
- **Role-based UI**: Interface adapts based on user role and permissions

### Admin Management:
- Create Super Admin accounts (Super Admin only)
- Create Level Admin accounts with academic level assignment
- Visual role indicators and level information
- User management with role-based restrictions

### Data Filtering:
- Automatic level-based filtering for Level Admins
- Optional level selection for Super Admins
- Consistent filtering across students, exams, and users
- Level-aware API endpoints

### User Experience:
- Role-appropriate dashboards and navigation
- Clear level information display
- Intuitive admin creation workflow
- Responsive design with role-based styling

## Security Measures

### Middleware Protection:
- All admin routes protected with `admin.level` middleware
- Automatic level_id injection for Level Admins
- Role-based access validation

### API Security:
- Authentication required for all admin operations
- Level-based authorization for resource access
- Proper error handling for unauthorized access

### Frontend Security:
- Role-based component rendering
- Client-side route protection
- Secure token-based authentication

## Database Relationships

```
acd_sessions (Academic Sessions/Levels)
├── users (level_id foreign key)
├── students (level_id foreign key)  
└── exams (level_id foreign key)

users
├── role: 'super_admin' | 'level_admin' | 'admin' | 'lecturer' | 'invigilator'
└── level_id: references acd_sessions(id)
```

## Backward Compatibility

- Existing admin users continue to function as before
- Regular admin role maintained for legacy support
- Existing API endpoints enhanced but not breaking
- Gradual migration path for existing data

## Usage Examples

### Creating a Super Admin:
```javascript
POST /api/create-super-admin
{
  "full_name": "John Doe",
  "email": "john@example.com", 
  "password": "securepassword"
}
```

### Creating a Level Admin:
```javascript
POST /api/create-level-admin
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword", 
  "level_id": 1
}
```

### Level-filtered Student Retrieval:
```javascript
GET /api/students-by-level?level_id=1  // Super Admin
GET /api/students-by-level              // Level Admin (auto-filtered)
```

## Testing Recommendations

1. **Role Access Testing**: Verify each role can only access appropriate resources
2. **Level Isolation Testing**: Ensure Level Admins cannot see other levels' data
3. **Admin Creation Testing**: Test Super Admin and Level Admin creation workflows
4. **UI Responsiveness Testing**: Verify interface adapts correctly to user roles
5. **API Security Testing**: Confirm unauthorized access is properly blocked

## Future Enhancements

1. **Audit Logging**: Track admin actions for security and compliance
2. **Role Permissions Matrix**: More granular permission system
3. **Bulk Operations**: Level-aware bulk operations for efficiency
4. **Admin Hierarchy**: Sub-levels within academic levels
5. **Resource Usage Analytics**: Level-specific usage statistics and reporting

## Conclusion

The hierarchical admin system provides robust, scalable administrative access control while maintaining backward compatibility. The implementation ensures proper resource isolation between academic levels while providing Super Admins with comprehensive system oversight capabilities.
