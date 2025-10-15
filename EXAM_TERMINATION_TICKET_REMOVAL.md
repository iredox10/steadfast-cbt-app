# Exam Termination and Ticket Removal

## Overview
When an admin terminates an exam, the system automatically removes all student tickets (candidate records) for that exam. This ensures a clean state for future exams.

## What Happens When Exam is Terminated

### 1. **Archive Creation**
Before removing any data, the system:
- Creates an exam archive with complete results
- Saves all student scores and statistics
- Stores questions answered and correct answers
- Preserves submission times

### 2. **Ticket/Candidate Removal**
The system then:
- **Deletes ALL candidate records** for the terminated exam
- This includes all ticket numbers
- Removes check-in/check-out times
- Clears login status

### 3. **Student Status Reset**
All students are reset:
- `is_logged_on` → 'no'
- `checkin_time` → null
- `checkout_time` → null

### 4. **Exam Deactivation**
The exam is marked as finished:
- `activated` → 'no'
- `finished_time` → current timestamp
- `invigilator` → null

## Code Implementation

**File:** `app/Http/Controllers/Admin.php`

**Method:** `terminate_exam($exam_id)`

### Key Lines:
```php
// Archive exam data BEFORE deletion
ExamArchive::create([...]);

// Remove all tickets/candidates for this exam
Candidate::where('exam_id', $exam_id)->delete();

// Reset student statuses
Student::query()->update([
    'is_logged_on' => 'no',
    'checkin_time' => null,
    'checkout_time' => null,
]);

// Deactivate exam
$exam->activated = 'no';
$exam->finished_time = now();
$exam->save();
```

## Benefits

✅ **Clean Slate** - New exams start fresh without old tickets  
✅ **Data Preserved** - All results saved in archive before deletion  
✅ **Security** - Old tickets can't be reused  
✅ **Clear Status** - Students show as "not checked in" after termination  

## Verification

### Check Current Status
```bash
php check_exam_termination.php
```

This shows:
- Active exam and current tickets
- Terminated exams (should have 0 candidates)
- Archive status for each exam

### Expected Results After Termination

**Before Termination:**
- Active exam: Yes
- Tickets in system: 5 (for example)
- Candidates table: Has records

**After Termination:**
- Active exam: No
- Tickets in system: 0
- Candidates table: Empty (for that exam)
- Exam archive: Created with all results

## Admin Workflow

1. **Activate Exam** → Tickets generated for enrolled students
2. **Students Take Exam** → Tickets used for login
3. **Terminate Exam** → 
   - Results archived
   - **Tickets deleted**
   - Students reset
   - Exam deactivated

4. **Next Exam** → Fresh ticket generation

## Important Notes

1. **Irreversible**: Once terminated, tickets are permanently deleted
2. **Archive Safe**: All data is safely stored in exam archives
3. **No Reuse**: Old tickets cannot be reused for future exams
4. **Automatic**: No manual intervention needed to remove tickets

## Database Tables Affected

- `candidates` - Ticket records DELETED
- `students` - Status reset (is_logged_on, checkin_time, checkout_time)
- `exams` - Deactivated and marked as finished
- `exam_archives` - New record CREATED with all results

## Testing

To verify ticket removal works correctly:

1. Note current tickets before termination
2. Terminate the exam via admin panel
3. Run verification script
4. Confirm candidates count = 0 for terminated exam
5. Confirm exam archive exists with results
