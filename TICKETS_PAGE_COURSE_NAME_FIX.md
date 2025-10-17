# Tickets Page Course Name Fix

## Overview
Fixed the "undefined - undefined" display issue on exam cards in the admin tickets page by correcting the course field names to match the actual database schema.

## Date
January 18, 2025 (October 17, 2025 in context)

## Problem Statement
Exam cards on the tickets page were displaying:
- "Exam #3" ✅ (correct)
- "undefined - undefined" ❌ (should show course code and title)

This was caused by using incorrect field names (`course_code`, `course_name`) that don't exist in the Course model.

## Root Cause

### Incorrect Field Names
The `getCourseName()` function was trying to access:
```jsx
course.course_code  // ❌ Doesn't exist
course.course_name  // ❌ Doesn't exist
```

### Actual Course Model Fields
According to `app/Models/Course.php`, the fillable fields are:
```php
protected $fillable = [
    'semester_id',
    'acd_session_id',
    'code',           // ✅ This is the correct field
    'title',          // ✅ This is the correct field
    'credit_unit',
    'created_by'
];
```

## Solution

### Updated getCourseName Function

**Before:**
```jsx
const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === parseInt(courseId));
    return course ? `${course.course_code} - ${course.course_name}` : 'Unknown Course';
    // Returns "undefined - undefined" when fields don't exist
};
```

**After:**
```jsx
const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === parseInt(courseId));
    if (!course) return 'Unknown Course';
    
    // Course model fields are: code, title, credit_unit
    const code = course.code || '';
    const title = course.title || '';
    
    if (code && title) {
        return `${code} - ${title}`;
    } else if (title) {
        return title;
    } else if (code) {
        return code;
    }
    return 'Unknown Course';
};
```

## Key Improvements

### 1. Correct Field Names
✅ Changed from `course_code` → `code`
✅ Changed from `course_name` → `title`

### 2. Defensive Programming
✅ Early return if course not found
✅ Fallback to empty string if field is undefined
✅ Multiple return scenarios:
   - Both code and title: "CSC301 - Database Systems"
   - Only title: "Database Systems"
   - Only code: "CSC301"
   - Neither: "Unknown Course"

### 3. No More "undefined - undefined"
✅ Prevents template literal from concatenating undefined values
✅ Graceful degradation if data is missing

## Expected Display

### Complete Data
```
┌────────────────────────────────────┐
│  📚 Exam #3          [Active]      │
├────────────────────────────────────┤
│  Database Systems Midterm          │
│  CSC301 - Database Systems         │ ← Fixed!
│                                    │
│  🕐 Duration: 90 minutes           │
│  👨‍🏫 Invigilator: john@example.com│
│  📅 Activated: Oct 17, 2025        │
└────────────────────────────────────┘
```

### Partial Data (only title)
```
│  Database Systems                  │ ← Shows title only
```

### Partial Data (only code)
```
│  CSC301                            │ ← Shows code only
```

### No Data
```
│  Unknown Course                    │ ← Fallback
```

## Testing Scenarios

### Test 1: Normal Case
**Setup:**
- Course has both `code` and `title`
- Example: `{ code: 'CSC301', title: 'Database Systems' }`

**Expected Result:**
- Display: "CSC301 - Database Systems"

### Test 2: Missing Code
**Setup:**
- Course has only `title`
- Example: `{ code: null, title: 'Database Systems' }`

**Expected Result:**
- Display: "Database Systems"

### Test 3: Missing Title
**Setup:**
- Course has only `code`
- Example: `{ code: 'CSC301', title: null }`

**Expected Result:**
- Display: "CSC301"

### Test 4: Course Not Found
**Setup:**
- Course ID doesn't exist in courses array

**Expected Result:**
- Display: "Unknown Course"

### Test 5: Empty Fields
**Setup:**
- Course exists but both fields are empty
- Example: `{ code: '', title: '' }`

**Expected Result:**
- Display: "Unknown Course"

## Database Schema Reference

### courses table
```sql
CREATE TABLE courses (
    id BIGINT PRIMARY KEY,
    semester_id BIGINT,
    acd_session_id BIGINT,
    code VARCHAR(255),        -- Course code (e.g., "CSC301")
    title VARCHAR(255),       -- Course title (e.g., "Database Systems")
    credit_unit INT,
    created_by BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Example Data
```json
{
    "id": 1,
    "code": "CSC301",
    "title": "Database Systems",
    "credit_unit": 3,
    "semester_id": 2,
    "acd_session_id": 1
}
```

## Related Code

### Backend Course Model
**File:** `app/Models/Course.php`
```php
protected $fillable = [
    'semester_id',
    'acd_session_id',
    'code',           // Not course_code
    'title',          // Not course_name
    'credit_unit',
    'created_by'
];
```

### Frontend Usage
**File:** `frontend/src/pages/admin/Tickets.jsx`
```jsx
// Used in exam card display
<p className="font-semibold text-gray-700 mb-3 line-clamp-2 text-sm">
    {getCourseName(exam.course_id)}
</p>

// Used in search filter
const courseName = getCourseName(exam.course_id).toLowerCase();
```

### ViewTicketsModal
The fixed function also affects the modal:
```jsx
<ViewTicketsModal
    examId={selectedExamForTickets.id}
    courseName={getCourseName(selectedExamForTickets.course_id)}
    onClose={...}
/>
```

## Impact

### Before Fix
- ❌ Confusing "undefined - undefined" display
- ❌ Poor user experience
- ❌ Hard to identify which exam/course
- ❌ Search by course name doesn't work properly

### After Fix
- ✅ Clear course identification
- ✅ Professional display
- ✅ Multiple fallback scenarios
- ✅ Search works correctly
- ✅ Consistent with database schema

## Common Pitfalls Avoided

### 1. Template Literal Concatenation
```jsx
// ❌ BAD - Creates "undefined - undefined"
`${course.course_code} - ${course.course_name}`

// ✅ GOOD - Checks before concatenating
if (code && title) {
    return `${code} - ${title}`;
}
```

### 2. Direct Property Access
```jsx
// ❌ BAD - Crashes if course is null
return `${course.code} - ${course.title}`;

// ✅ GOOD - Early return for null course
if (!course) return 'Unknown Course';
```

### 3. No Fallbacks
```jsx
// ❌ BAD - No fallback for missing data
const code = course.code;
const title = course.title;

// ✅ GOOD - Fallback to empty string
const code = course.code || '';
const title = course.title || '';
```

## Files Modified

1. `frontend/src/pages/admin/Tickets.jsx`
   - Updated `getCourseName()` function
   - Changed field names: `course_code` → `code`, `course_name` → `title`
   - Added defensive checks and fallbacks

## Verification Steps

1. **Check Database:**
   ```sql
   SELECT id, code, title FROM courses LIMIT 5;
   ```

2. **Check API Response:**
   ```bash
   curl http://localhost:8000/api/get-courses \
     -H "Authorization: Bearer {token}"
   ```

3. **Check Frontend Display:**
   - Navigate to `/admin-tickets/:id`
   - Verify course names display correctly
   - Test search functionality

## Related Issues

This same pattern might exist in other files. Check:
- Other admin pages using courses
- Student pages showing course info
- Instructor pages

## Version
- **Date:** January 18, 2025
- **Status:** ✅ Complete and Tested
- **File:** `frontend/src/pages/admin/Tickets.jsx`
- **Priority:** HIGH - Critical UX bug
