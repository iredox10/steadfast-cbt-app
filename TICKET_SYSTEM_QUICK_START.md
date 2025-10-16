# 🚀 Quick Start: New Ticket System

## For Level Admins

### Activating an Exam

1. Navigate to the **Dashboard** or **Exams** page
2. Find the exam you want to activate
3. Click the **"Activate"** button
4. Assign an invigilator
5. Click **"Assign & Activate"**

**What happens automatically:**
- System counts enrolled students in the course
- Generates exact number of unassigned tickets (e.g., 50 students = 50 tickets)
- Tickets stored in database, ready for students to claim
- You'll see: *"Exam activated and 50 tickets generated in the ticket pool"*

**Example ticket numbers generated:** `123456, 234567, 345678...` (random 6-digit numbers)

---

### Terminating an Exam

1. Go to the **Dashboard**
2. Find the active exam
3. Click **"Terminate"** button
4. Confirm termination

**What happens automatically:**
- All student results archived
- All tickets deleted (used and unused)
- Student statuses reset
- Exam marked as completed

---

## For Invigilators

### Providing Tickets to Students

Since tickets are in a pool (not pre-assigned), you can:

1. **Check available tickets** in the system (upcoming feature)
2. **Give any ticket number** from the pool to students
3. Students enter their candidate number + ticket number to log in
4. First student to use a ticket "claims" it

**Important:** Once a ticket is used by a student, only that student can use it again.

---

## For Students

### First Time Login

1. Go to the exam login page
2. Enter your **Candidate Number** (e.g., `ST2024001`)
3. Enter any **available ticket number** provided by invigilator (e.g., `123456`)
4. Click **Login**

**If successful:**
- You're assigned that ticket permanently for this exam
- Ticket marked as "used" in system
- You can now start the exam

**If failed:**
- "Invalid or already used ticket number" - Try a different ticket
- "You are not enrolled in this exam's course" - Contact admin
- "No active exam found" - Wait for exam to be activated

---

### Re-Login (If You Get Disconnected)

1. Go back to login page
2. Enter your **Candidate Number**
3. Enter the **SAME ticket number** you used before
4. Click **Login**

**What happens:**
- System recognizes your ticket
- Logs you back in
- All your previous answers are preserved
- Timer continues from where it left off

**Important:** You MUST use the same ticket number. Using a different number will fail.

---

### Time Extension

If the invigilator extends your time:

1. **Nothing changes** - keep using your same ticket
2. Your timer gets extended
3. Continue with your exam
4. No need to re-login unless you closed the browser

---

## How It Works (Simple Explanation)

### Old System ❌
```
Activate Exam
    ↓
Tickets PRE-ASSIGNED to each student
    ↓
Student must use their specific ticket
```

**Problem:** What if student doesn't know their ticket before the exam?

### New System ✅
```
Activate Exam
    ↓
Generate POOL of unassigned tickets
    ↓
Students pick any available ticket on first login
    ↓
Ticket becomes theirs for rest of exam
```

**Benefit:** Flexible, fair, first-come first-served!

---

## Common Scenarios

### Scenario 1: Normal Exam Flow

```
1. Admin activates exam → 50 tickets created
2. Student A logs in with ticket 123456 → Gets ticket 123456
3. Student B logs in with ticket 234567 → Gets ticket 234567
4. Student A disconnects, logs in again with 123456 → Works!
5. Student C tries to use 123456 → Fails (already assigned to A)
6. Admin terminates exam → All tickets deleted
```

### Scenario 2: Re-Activation

```
1. Exam 1 activated → Tickets: 123456, 234567, 345678
2. Student uses 123456
3. Exam 1 terminated → All tickets deleted
4. Exam 1 activated AGAIN → NEW tickets: 456789, 567890, 678901
5. Old ticket 123456 no longer works
6. Students must use new tickets
```

### Scenario 3: Time Extension

```
1. Student logs in with ticket 123456
2. Invigilator extends student's time by 30 minutes
3. Student's ticket remains 123456
4. Student can re-login with 123456 anytime
5. Extended time preserved
```

---

## Troubleshooting

### "Invalid or already used ticket number"

**Possible Causes:**
1. Someone else already claimed that ticket
2. Ticket number doesn't exist
3. You typed it wrong

**Solutions:**
- Try a different ticket number
- Ask invigilator for another ticket
- Double-check you entered it correctly

---

### "You are not enrolled in this exam's course"

**Cause:** You're not registered for this course

**Solution:** Contact admin to enroll you in the course first

---

### "No active exam found"

**Cause:** The exam hasn't been activated yet

**Solution:** Wait for the admin/invigilator to activate the exam

---

### Can't re-login after disconnection

**Cause:** You're trying to use a different ticket number

**Solution:** Use the SAME ticket number you used when you first logged in

---

## Database Verification

### For Developers/Admins

Check tickets for an exam:

```sql
-- See all tickets for exam ID 1
SELECT * FROM exam_tickets WHERE exam_id = 1;

-- See available tickets
SELECT * FROM exam_tickets WHERE exam_id = 1 AND is_used = false;

-- See used tickets with student info
SELECT 
    et.ticket_no,
    s.candidate_no,
    s.full_name,
    et.assigned_at
FROM exam_tickets et
LEFT JOIN students s ON et.assigned_to_student_id = s.id
WHERE et.exam_id = 1 AND et.is_used = true;
```

---

## Testing Steps

Before going live with students:

1. ✅ **Activate a test exam**
   - Verify tickets are created
   - Count matches enrolled students

2. ✅ **Test first login**
   - Use a test student account
   - Enter any available ticket
   - Verify login works

3. ✅ **Test re-login**
   - Log out
   - Log back in with SAME ticket
   - Verify it works

4. ✅ **Test wrong ticket re-login**
   - Try logging in with different ticket
   - Should fail with error message

5. ✅ **Test termination**
   - Terminate the exam
   - Verify tickets are deleted
   - Verify results are archived

6. ✅ **Test re-activation**
   - Activate same exam again
   - Verify new tickets are generated
   - Old tickets shouldn't work

---

## Benefits Summary

### ✅ For Level Admins
- One-click activation generates all tickets
- No manual ticket assignment needed
- Clean termination with automatic cleanup

### ✅ For Invigilators
- Give any ticket to any student
- No need to track "who gets which ticket"
- Easy time extension without ticket changes

### ✅ For Students
- Use any available ticket
- Can re-login if needed
- Time extensions work seamlessly

---

## Migration Note

**If you have an active exam running with the old system:**

Option 1: Let it finish, then use new system for next exam  
Option 2: Terminate it and re-activate (students will need new tickets)

**Recommended:** Option 1 - don't disrupt ongoing exams

---

## Support

If you encounter issues:

1. Check the `NEW_TICKET_SYSTEM.md` for detailed technical information
2. Verify students are enrolled in the course
3. Confirm exam is activated
4. Check database for available tickets
5. Review Laravel logs for errors

---

**Status:** ✅ Ready to use!  
**Version:** 2.0  
**Last Updated:** October 15, 2025
