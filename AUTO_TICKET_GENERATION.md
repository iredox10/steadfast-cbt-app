# Automatic Ticket Generation on Exam Activation

## Implementation Summary

### What Was Changed

#### 1. Backend - Admin Controller (`app/Http/Controllers/Admin.php`)

##### `activate_exam()` Method - Auto-generate Tickets
When an exam is activated, the system now automatically:
- Finds all students enrolled in the exam's course
- Generates a unique 6-digit ticket number for each student
- Creates a Candidate record with the ticket information
- Sets initial check-in time and status

**Key Features:**
- Only generates tickets for students who don't already have one
- Ensures unique ticket numbers (no duplicates)
- Automatically sets check-in time when ticket is generated
- Returns a success message indicating tickets were generated

##### `getStudentsByLevel()` Method - Include Ticket Information
When fetching students for the admin panel:
- Checks if there's an active exam
- Fetches ticket number for each student if they have a candidate record
- Adds `ticket_no` and `candidate_id` fields to student data
- Returns null if no active exam or student hasn't been assigned a ticket

#### 2. Frontend - AdminStudents Component (`frontend/src/pages/admin/AdminStudents.jsx`)

##### Ticket Display Column
- Added visual styling for ticket display
- Shows ticket number with green badge when generated
- Shows "Not generated" in gray when no ticket exists
- Uses monospace font for ticket numbers for better readability

**Visual Indicators:**
- ✅ Generated tickets: Green background, border, bold font
- ⚠️ Not generated: Gray background, italic text

### How It Works

1. **Admin activates an exam** via the admin dashboard
2. **System automatically:**
   - Deactivates all other exams
   - Activates the selected exam
   - Finds all students enrolled in the exam's course
   - Generates unique 6-digit tickets for each student
   - Creates Candidate records with ticket information

3. **Admin views students** in the AdminStudents page
   - Students now show their ticket numbers if an exam is active
   - Tickets are displayed with visual indicators

4. **Invigilators** can see students already have tickets
   - No need to manually generate tickets for each student
   - Can still regenerate tickets if needed

### Benefits

1. **Time Saving**: No need to manually check in each student before exam
2. **Consistency**: All enrolled students get tickets automatically
3. **Visibility**: Admins can see ticket status immediately
4. **Flexibility**: System still allows manual ticket regeneration if needed

### Testing

To verify the implementation:

1. Go to the admin dashboard
2. Activate an exam (or reactivate an existing one)
3. Go to the AdminStudents page
4. You should see ticket numbers for all students enrolled in the activated exam's course

### Files Modified

1. `app/Http/Controllers/Admin.php`
   - `activate_exam()` - Added ticket generation logic
   - `getStudentsByLevel()` - Added ticket information to response

2. `frontend/src/pages/admin/AdminStudents.jsx`
   - Updated ticket column styling for better visual feedback

### Database Tables Involved

- `students` - Student information
- `exams` - Exam details and activation status
- `courses` - Course information
- `student_courses` - Student enrollment in courses
- `candidates` - Ticket numbers and check-in information
