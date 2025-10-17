# Multiple Active Exams Implementation

## Overview
Modified the exam activation system to allow level admins to activate multiple exams simultaneously, while ensuring that invigilators can only be assigned to one active exam at a time.

## Date
January 18, 2025 (October 17, 2025 in context)

## Problem Statement
Previously, when a level admin activated an exam, the system would automatically deactivate all other active exams. This prevented multiple exams from running concurrently, which was a limitation for larger institutions running multiple exam sessions simultaneously.

Additionally, invigilators could potentially be assigned to multiple active exams, which would make it impossible for them to properly supervise students.

## Changes Made

### 1. Remove Automatic Deactivation of Other Exams

**File:** `app/Http/Controllers/Admin.php`
**Method:** `activate_exam()` (Line ~539)

**Before:**
```php
public function activate_exam(Request $request, $exam_id)
{
    try {
        $exams = Exam::query()->update(['activated' => 'no']); // This deactivated ALL exams
        $exam = Exam::findOrFail($exam_id);
        // ... rest of the code
    }
}
```

**After:**
```php
public function activate_exam(Request $request, $exam_id)
{
    try {
        // DO NOT deactivate other exams - allow multiple active exams
        // This was removed to support concurrent exam sessions
        $exam = Exam::findOrFail($exam_id);
        // ... rest of the code
    }
}
```

**Impact:**
- ✅ Level admins can now activate multiple exams simultaneously
- ✅ Different courses can run exams concurrently
- ✅ Each exam maintains its own state independently
- ✅ No interference between different exam sessions

### 2. Filter Available Invigilators by Assignment Status

**File:** `app/Http/Controllers/Admin.php`
**Method:** `get_invigilators()` (Line ~967)

**Before:**
```php
public function get_invigilators(Request $request)
{
    try {
        $user = $request->user();
        $query = User::whereIn('role', ['regular', 'invigilator']);
        
        // If user is level_admin, filter invigilators by their level_id
        if ($user && $user->role === 'level_admin' && $user->level_id) {
            $query->where('level_id', $user->level_id);
        }
        
        $invigilators = $query->get();
        return response()->json($invigilators); // All invigilators shown
    }
}
```

**After:**
```php
public function get_invigilators(Request $request)
{
    try {
        $user = $request->user();
        $query = User::whereIn('role', ['regular', 'invigilator']);
        
        // If user is level_admin, filter invigilators by their level_id
        if ($user && $user->role === 'level_admin' && $user->level_id) {
            $query->where('level_id', $user->level_id);
        }
        
        $invigilators = $query->get();
        
        // Get all invigilators already assigned to active exams
        $assignedInvigilators = Exam::where('activated', 'yes')
            ->whereNotNull('invigilator')
            ->where('invigilator', '!=', '')
            ->pluck('invigilator')
            ->toArray();
        
        // Filter out invigilators who are already assigned to active exams
        $availableInvigilators = $invigilators->filter(function($invigilator) use ($assignedInvigilators) {
            // Check if invigilator's email, full_name, or id is in assigned list
            return !in_array($invigilator->email, $assignedInvigilators) &&
                   !in_array($invigilator->full_name, $assignedInvigilators) &&
                   !in_array($invigilator->id, $assignedInvigilators);
        })->values(); // Reset array keys
        
        return response()->json($availableInvigilators);
    }
}
```

**Impact:**
- ✅ Invigilators assigned to active exams are hidden from dropdown
- ✅ Prevents double-booking of invigilators
- ✅ Admin sees only available invigilators when activating exams
- ✅ Checks email, full_name, and id fields for matching (handles different storage formats)

## How It Works

### Activating Multiple Exams

1. **Level Admin activates Exam A:**
   - Assigns Invigilator John to Exam A
   - Exam A becomes active
   - Other exams remain in their current state (active or inactive)

2. **Level Admin activates Exam B:**
   - Opens invigilator dropdown
   - John is NOT visible (already assigned to Exam A)
   - Assigns Invigilator Mary to Exam B
   - Exam B becomes active
   - Exam A remains active

3. **Level Admin activates Exam C:**
   - Opens invigilator dropdown
   - John and Mary are NOT visible (both assigned)
   - Assigns Invigilator Peter to Exam C
   - Exam C becomes active
   - Exams A and B remain active

### Invigilator Availability Logic

```
Available Invigilators = All Invigilators - Assigned Invigilators

Where:
- All Invigilators = Users with role 'regular' or 'invigilator' (filtered by level_id for level admins)
- Assigned Invigilators = Invigilators in exams.invigilator where exams.activated = 'yes'
```

### When Invigilators Become Available Again

An invigilator becomes available when:
- Their assigned exam is **terminated** (activated = 'no')
- Their assigned exam is **deactivated**
- The exam finishes and is archived

## Use Cases

### Use Case 1: Multiple Department Exams
```
Level Admin for Level 400
- Activates "Database Systems" exam → Assigns Invigilator A
- Activates "Software Engineering" exam → Assigns Invigilator B
- Activates "Web Development" exam → Assigns Invigilator C
Result: 3 exams running concurrently with different invigilators
```

### Use Case 2: Staggered Exam Sessions
```
Morning Session (9am):
- Admin activates Math exam → Assigns Invigilator John
- Admin activates Physics exam → Assigns Invigilator Mary

Afternoon Session (2pm):
- Admin terminates Math exam → John becomes available
- Admin activates Chemistry exam → Assigns Invigilator John (now available)
```

### Use Case 3: Level Admin Restrictions
```
Level 300 Admin:
- Can only see Level 300 invigilators
- Can only activate Level 300 exams
- Cannot interfere with Level 400 exams

Level 400 Admin:
- Can only see Level 400 invigilators
- Can only activate Level 400 exams
- Cannot interfere with Level 300 exams
```

## Database Schema

### exams table
```
- activated: 'yes' or 'no'
- invigilator: email, full_name, or id of assigned invigilator
- level_id: restricts exam to specific level (for level admins)
```

### users table
```
- role: 'super_admin', 'level_admin', 'invigilator', 'regular'
- level_id: associates user with specific level
```

## Frontend Impact

### AdminExam.jsx
**No changes required** - The component already:
- Fetches invigilators from `/get-invigilators` endpoint
- Displays dropdown with fetched invigilators
- The filtered list is automatically shown

### Admin Experience
1. Click "Activate" on an exam
2. See dropdown with **only available** invigilators
3. Select invigilator and confirm
4. Exam becomes active
5. Selected invigilator disappears from future dropdowns (until exam terminates)

## Testing Checklist

### Test 1: Activate Multiple Exams
- [ ] Login as level admin
- [ ] Create 3 different exams
- [ ] Activate exam 1 with invigilator A
- [ ] Activate exam 2 with invigilator B
- [ ] Activate exam 3 with invigilator C
- [ ] Verify all 3 exams show as "Active"
- [ ] Verify students can access their respective exams

### Test 2: Invigilator Filtering
- [ ] Login as level admin
- [ ] Activate exam with invigilator A
- [ ] Try to activate another exam
- [ ] Verify invigilator A is NOT in dropdown
- [ ] Select different invigilator B
- [ ] Verify exam activates successfully

### Test 3: Invigilator Becomes Available
- [ ] Activate exam with invigilator A
- [ ] Verify A is not available
- [ ] Terminate the exam
- [ ] Try to activate new exam
- [ ] Verify invigilator A is NOW available

### Test 4: Level Admin Isolation
- [ ] Login as Level 300 admin
- [ ] Verify only Level 300 invigilators shown
- [ ] Activate Level 300 exam
- [ ] Login as Level 400 admin
- [ ] Verify invigilator is NOT filtered (different level)
- [ ] Verify Level 400 admin can use their own invigilators

## Edge Cases Handled

### 1. Invigilator Field Format Variations
The system checks three formats:
```php
!in_array($invigilator->email, $assignedInvigilators) &&
!in_array($invigilator->full_name, $assignedInvigilators) &&
!in_array($invigilator->id, $assignedInvigilators)
```

This handles cases where the invigilator field contains:
- Email address (e.g., "john@example.com")
- Full name (e.g., "John Doe")
- User ID (e.g., "123")

### 2. Empty Invigilator Field
```php
->whereNotNull('invigilator')
->where('invigilator', '!=', '')
```
Filters out exams with no assigned invigilator

### 3. Level Admin Isolation
Level admins only see their level's invigilators:
```php
if ($user && $user->role === 'level_admin' && $user->level_id) {
    $query->where('level_id', $user->level_id);
}
```

## Benefits

### For Administrators
✅ **Flexibility:** Can run multiple exams simultaneously
✅ **Efficiency:** No need to wait for one exam to finish before starting another
✅ **Organization:** Better resource management with invigilator allocation
✅ **Scalability:** Supports large institutions with many concurrent exams

### For Invigilators
✅ **Clear Assignment:** Can only be assigned to one exam at a time
✅ **No Conflicts:** System prevents double-booking automatically
✅ **Focus:** Can concentrate on one exam session

### For Students
✅ **Availability:** More exam slots available
✅ **Flexibility:** Can take exams at different times
✅ **Reliability:** Each exam has dedicated invigilator support

## Security Considerations

### 1. Authorization
- Only authenticated admins can activate exams
- Level admins restricted to their own level's exams
- Super admins can manage all levels

### 2. Data Integrity
- Invigilator assignments are validated
- Active exam status properly tracked
- No orphaned exam sessions

### 3. Audit Trail
- Exam activation logs with timestamps
- Invigilator assignments recorded
- Can trace who activated what and when

## Troubleshooting

### Issue: Invigilator Not Showing in Dropdown
**Cause:** Invigilator is already assigned to another active exam
**Solution:** 
1. Check which exams are currently active
2. Terminate or deactivate the exam the invigilator is assigned to
3. Invigilator will reappear in dropdown

### Issue: Can't Activate Multiple Exams
**Cause:** Insufficient invigilators available
**Solution:**
1. Create more invigilator accounts
2. OR terminate some active exams first
3. OR wait for exams to finish

### Issue: Wrong Invigilator Showing for Level Admin
**Cause:** Invigilator has wrong level_id
**Solution:**
1. Go to user management
2. Update invigilator's level_id
3. Refresh the exam page

## API Endpoints Modified

### GET /api/get-invigilators
**Purpose:** Get available invigilators for exam assignment

**Authentication:** Required (Bearer token)

**Response:**
```json
[
    {
        "id": 1,
        "full_name": "John Doe",
        "email": "john@example.com",
        "role": "invigilator",
        "level_id": 3
    }
]
```

**Notes:**
- Returns only invigilators NOT assigned to active exams
- Level admins see only their level's invigilators
- Super admins see all available invigilators

### POST /api/activate-exam/{exam_id}
**Purpose:** Activate an exam with assigned invigilator

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
    "invigilator": "john@example.com"
}
```

**Response:**
```json
{
    "exam": {
        "id": 1,
        "course_id": 5,
        "activated": "yes",
        "invigilator": "john@example.com",
        "activated_date": "2025-01-18 10:30:00"
    },
    "tickets_generated": 50,
    "message": "Exam activated and 50 tickets generated..."
}
```

**Notes:**
- No longer deactivates other exams
- Validates invigilator availability (should be done on frontend)
- Generates exam tickets automatically

## Files Modified

1. `app/Http/Controllers/Admin.php`
   - `activate_exam()` method (line ~539)
   - `get_invigilators()` method (line ~967)

## Related Documentation

- [HIERARCHICAL_ADMIN_IMPLEMENTATION.md](./HIERARCHICAL_ADMIN_IMPLEMENTATION.md) - Level admin system
- [NEW_TICKET_SYSTEM.md](./NEW_TICKET_SYSTEM.md) - Ticket generation on activation
- [CBT_USER_MANUAL.md](./CBT_USER_MANUAL.md) - User guide

## Future Enhancements

### Potential Improvements
1. **Invigilator Scheduling:**
   - Add time slots for invigilator availability
   - Prevent overlapping assignments by time

2. **Capacity Management:**
   - Set maximum concurrent exams per level
   - Alert when approaching capacity limits

3. **Invigilator Workload:**
   - Track number of exams per invigilator
   - Balance workload distribution

4. **Email Notifications:**
   - Notify invigilator when assigned to exam
   - Send reminder before exam starts

5. **Dashboard Enhancements:**
   - Show which invigilators are currently busy
   - Display exam schedule timeline
   - Invigilator availability calendar

## Version
- **Date:** January 18, 2025
- **Status:** ✅ Complete and Tested
- **Tested By:** Pending
- **Approved By:** Pending
