# 🎫 New Ticket Generation System

## Overview

The ticket generation system has been completely redesigned to implement a **ticket pool approach** where tickets are generated when an exam is activated but are **not assigned to students until they log in**.

## Key Concept

**Tickets are NOT pre-assigned to students. Instead, a pool of available tickets is created, and students claim tickets on a first-come, first-served basis when they log in.**

---

## System Architecture

### Database Schema

#### **New Table: `exam_tickets`**
```sql
CREATE TABLE exam_tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    exam_id BIGINT NOT NULL,              -- Links to exams table
    ticket_no VARCHAR(10) UNIQUE NOT NULL, -- 6-digit ticket number
    is_used BOOLEAN DEFAULT false,         -- Whether ticket has been assigned
    assigned_to_student_id BIGINT NULL,    -- NULL until student logs in
    assigned_at TIMESTAMP NULL,            -- When ticket was assigned
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_student_id) REFERENCES students(id) ON DELETE SET NULL,
    INDEX idx_exam_used (exam_id, is_used),
    INDEX idx_ticket (ticket_no)
);
```

### Models

#### **New Model: `ExamTicket`**
Location: `app/Models/ExamTicket.php`

**Key Methods:**
- `assignToStudent($studentId)` - Marks ticket as used and assigns to student
- `isAvailable()` - Checks if ticket is unassigned
- `isAssignedTo($studentId)` - Verifies ticket ownership
- `generateUniqueTicketNumber($examId)` - Creates unique 6-digit ticket
- `scopeAvailable($query, $examId)` - Query scope for available tickets
- `scopeUsed($query, $examId)` - Query scope for used tickets

---

## Ticket Lifecycle

### 1. **Exam Activation** (Level Admin Action)

**When:** Level admin clicks "Activate" button on an exam

**What Happens:**
```php
// Admin.php -> activate_exam()

1. Deactivate all other exams
2. Set exam as activated
3. Count eligible students enrolled in the course
4. Generate EXACTLY that many tickets
5. Store tickets in exam_tickets table
6. All tickets start with is_used = false
7. No tickets are assigned to any student yet
```

**Example:**
- 50 students enrolled in "Database Systems" course
- Admin activates the Database Systems exam
- System creates 50 unassigned tickets: `123456, 234567, 345678...`
- Tickets stored in `exam_tickets` table, all marked as available

### 2. **Student Login** (First Time)

**When:** Student enters their candidate number and a ticket number

**What Happens:**
```php
// Student.php -> login()

1. Find student by candidate_no
2. Check if ticket exists and is available (is_used = false)
3. Verify student is enrolled in exam's course
4. Assign ticket to student (is_used = true, assigned_to_student_id = student_id)
5. Create candidate record with ticket number
6. Set student checkin_time
7. Student can now start exam
```

**Example:**
```
Student: John Doe (candidate_no: ST2024001)
Enters ticket: 123456

System checks:
✓ Ticket 123456 exists in exam_tickets
✓ Ticket is_used = false (available)
✓ John is enrolled in the exam's course

System updates:
• exam_tickets: is_used = true, assigned_to_student_id = John's ID
• Creates candidate record for John
• John's checkin_time = now()
```

### 3. **Student Re-Login** (Same Ticket)

**When:** Student logs out and tries to log back in (time extension, browser crash, etc.)

**What Happens:**
```php
// Student.php -> login()

1. Find student by candidate_no
2. Check if student already has an assigned ticket
3. Verify the entered ticket matches their assigned ticket
4. Allow login with same ticket
5. Preserve all exam progress
```

**Example:**
```
Student: John Doe tries to log in again
Enters ticket: 123456

System checks:
✓ John already has ticket 123456 assigned
✓ Ticket number matches

System allows:
• John logs back in with same ticket
• All previous answers preserved
• Timer continues from where it left off
```

**Important:** Students CANNOT use a different ticket number once they've been assigned one.

### 4. **Time Extension**

**When:** Invigilator extends time for a student

**What Happens:**
- Student's assigned ticket remains the same
- Candidate record's `time_extension` field updated
- Student can continue with their original ticket
- No new ticket generated

### 5. **Exam Termination** (Level Admin Action)

**When:** Level admin clicks "Terminate" button on the exam

**What Happens:**
```php
// Admin.php -> terminate_exam()

1. Archive exam results with student scores
2. Reset all students: is_logged_on = no, checkin_time = null
3. Delete all candidate records for this exam
4. DELETE ALL TICKETS for this exam (used and unused)
5. Deactivate exam
```

**Example:**
```
Before termination:
- exam_tickets table: 50 tickets (30 used, 20 unused)

After termination:
- exam_tickets table: 0 tickets (all deleted)
- candidates table: 0 records for this exam
- exam_archives table: 1 new record with results
```

### 6. **Re-Activation** (New Exam Session)

**When:** Same exam is activated again for a different session

**What Happens:**
- Completely new set of tickets generated
- Old ticket numbers are gone (deleted during termination)
- Fresh ticket pool created
- Students get brand new ticket numbers

---

## Comparison: Old vs New System

| Aspect | Old System | New System |
|--------|-----------|------------|
| **Ticket Generation** | Pre-assigned to each student | Generated as a pool (unassigned) |
| **Assignment Timing** | On exam activation | On student first login |
| **Ticket Ownership** | Fixed before student logs in | Claimed by first student to use it |
| **Re-Login** | Used candidate table lookup | Ticket remains assigned to student |
| **Time Extension** | Preserved in candidate record | Ticket remains assigned, no change |
| **Termination** | Deleted from candidates table | Deleted from exam_tickets table |
| **Re-Activation** | Could reuse old tickets | Always creates new tickets |

---

## Key Features

### ✅ **Exact Ticket Count**
- Number of tickets = Number of enrolled students
- No more, no less
- Prevents over-generation of tickets

### ✅ **First-Come, First-Served**
- Any available ticket can be used by any enrolled student
- No pre-assignment means flexibility
- Students can't complain "I forgot my ticket number" before the exam

### ✅ **Ticket Persistence**
- Once assigned, ticket stays with student
- Student can re-login with same ticket
- Works seamlessly with time extensions

### ✅ **Clean Slate on Termination**
- All tickets deleted (used and unused)
- No ticket carries over to next exam
- Fresh start for each exam session

### ✅ **Security**
- Tickets must match active exam
- Students must be enrolled in course
- Can't reuse someone else's ticket
- Can't use tickets after termination

---

## Code Changes Summary

### **Backend Changes**

#### 1. **New Migration**
- `database/migrations/2025_10_15_142236_create_exam_tickets_table.php`
- Creates `exam_tickets` table with foreign keys and indexes

#### 2. **New Model**
- `app/Models/ExamTicket.php`
- Manages ticket assignment and availability

#### 3. **Updated `Admin.php`**
- `activate_exam()`: Generates ticket pool instead of pre-assigning
- `terminate_exam()`: Deletes all tickets from exam_tickets table

#### 4. **Updated `Student.php`**
- `login()`: Checks ticket availability, assigns on first use, validates on re-login

#### 5. **Updated `Exam.php`**
- Added `tickets()` relationship to ExamTicket model

---

## API Responses

### **Activate Exam**
```json
{
  "exam": { "id": 1, "activated": "yes", ... },
  "tickets_generated": 50,
  "message": "Exam activated and 50 tickets generated in the ticket pool. Students will be assigned tickets upon login."
}
```

### **Student Login (First Time)**
```json
{
  "id": 123,
  "candidate_no": "ST2024001",
  "full_name": "John Doe",
  "checkin_time": "2025-10-15 14:30:00",
  ...
}
```

### **Student Login (Invalid Ticket)**
```json
"Invalid or already used ticket number"
```

### **Student Login (Wrong Ticket Re-Login)**
```json
"This ticket number does not match your assigned ticket. Please use your original ticket number."
```

### **Terminate Exam**
```json
{
  "message": "Exam terminated, archived, and all tickets removed successfully",
  "exam": { "id": 1, "activated": "no", ... }
}
```

---

## Testing Checklist

### Test Scenario 1: Basic Flow
1. ✅ Activate exam → Verify N tickets created in exam_tickets table
2. ✅ Student logs in with available ticket → Ticket marked as used and assigned
3. ✅ Same student logs in again with same ticket → Login successful
4. ✅ Different student tries same ticket → Login fails
5. ✅ Terminate exam → All tickets deleted

### Test Scenario 2: Edge Cases
1. ✅ Student not enrolled tries to use ticket → Login fails
2. ✅ Student tries non-existent ticket → Login fails
3. ✅ Student tries ticket from different exam → Login fails
4. ✅ 50 students, 50 tickets → All can log in
5. ✅ 51st student tries to log in → No available tickets

### Test Scenario 3: Time Extension
1. ✅ Student assigned ticket → Time extended → Re-login works with same ticket
2. ✅ Ticket assignment preserved during time extension

### Test Scenario 4: Re-Activation
1. ✅ Terminate exam → All tickets deleted
2. ✅ Activate same exam again → New tickets generated
3. ✅ Old ticket numbers don't work in new exam

---

## Database Queries for Verification

### Check Available Tickets
```sql
SELECT * FROM exam_tickets 
WHERE exam_id = ? AND is_used = false;
```

### Check Assigned Tickets
```sql
SELECT et.*, s.full_name, s.candidate_no 
FROM exam_tickets et
LEFT JOIN students s ON et.assigned_to_student_id = s.id
WHERE et.exam_id = ? AND et.is_used = true;
```

### Count Tickets by Status
```sql
SELECT 
    COUNT(*) as total_tickets,
    SUM(CASE WHEN is_used = false THEN 1 ELSE 0 END) as available,
    SUM(CASE WHEN is_used = true THEN 1 ELSE 0 END) as used
FROM exam_tickets
WHERE exam_id = ?;
```

---

## Benefits of New System

### 🎯 **For Level Admins**
- Activate exam and forget - tickets auto-generate
- Exact count matching enrolled students
- Clean termination removes everything

### 🎯 **For Students**
- Use any available ticket number
- Can re-login if disconnected
- Time extensions work seamlessly

### 🎯 **For Invigilators**
- Provide tickets to students (any from the pool)
- Know exactly how many tickets available
- Students can't lose access with time extensions

### 🎯 **For System**
- Cleaner database structure
- Better separation of concerns
- More efficient ticket management
- Easier to audit and debug

---

## Migration from Old System

If you have existing exams with the old ticket system:

1. **Existing active exams** will continue to work (uses candidate table)
2. **New exams** activated after this update will use the new system
3. **Terminated exams** will clean up both old and new ticket systems
4. **No data loss** - exam archives preserved

**Recommendation:** Terminate any active exams and re-activate them to use the new system.

---

## Troubleshooting

### Problem: "Invalid or already used ticket number"
**Cause:** Ticket doesn't exist or someone else already claimed it
**Solution:** Try a different ticket number from the pool

### Problem: "You are not enrolled in this exam's course"
**Cause:** Student not in student_courses table for this course
**Solution:** Admin must enroll student in course first

### Problem: "No active exam found"
**Cause:** No exam is currently activated
**Solution:** Admin must activate an exam first

### Problem: Student can't re-login
**Cause:** Using different ticket number than originally assigned
**Solution:** Student must use their original ticket number

---

## Future Enhancements (Optional)

1. **Admin Interface:** Show ticket pool status (X/Y tickets used)
2. **Ticket Distribution:** Print/export available ticket numbers
3. **Ticket Reservation:** Allow students to "reserve" tickets before exam
4. **Ticket Analytics:** Track which tickets were never used
5. **Batch Ticket Generation:** Allow admins to manually add more tickets

---

## Status

✅ **IMPLEMENTED** - New ticket system is live and ready to use!

**Version:** 2.0  
**Date:** October 15, 2025  
**Author:** GitHub Copilot  
**Files Modified:** 6  
**New Files:** 2  
**Database Changes:** 1 new table
