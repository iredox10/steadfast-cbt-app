# Instructor Students Page - Issue Resolution

## Problem Summary
The instructor students page wasn't showing students and scores.

## Root Cause
1. **No users with role "instructor"** - The system uses "lecturer" as the role name
2. **Incorrect course_name in scores** - Was set to "Unknown Course"
3. **User needs to access correct URL with lecturer ID**

## Current System Data

### Lecturers in System
- **Lecturer ID 3**: ali (a@buk.com) 
- **Lecturer ID 4**: usman ali (usman@buk.com)

### Courses
- **Course ID 1**: Introduction To Computer Science (CSC101)
  - Created by: Level Admin (user_id 2)
  - Assigned to: Lecturer ali (ID 3)

### Students
- **Student ID 1**: idris adam (buk/com/25/0001)
  - Enrolled in: Course ID 1
  - Score: 2.00 (out of Introduction To Computer Science)

## What Was Fixed
✅ Updated the score record to show correct course name: "Introduction To Computer Science"

## How to Access Instructor Students Page

### Option 1: Direct URL
1. Log in as lecturer **ali** (a@buk.com)
2. Navigate to: `/instructor-students/3/1`
   - `/instructor-students/{lecturer_id}/{course_id}`

### Option 2: Through Instructor Dashboard
1. Log in as lecturer **ali** (a@buk.com)
2. Go to instructor dashboard
3. Click on the course "Introduction To Computer Science"
4. Click on "Students" to view students and scores

## Expected Results
You should now see:
- **Student List**: 1 student (idris adam)
- **Score Column**: 2.00
- **Download PDF/Excel**: Working with correct data

## API Endpoints
- `GET /get-students/{user_id}/{course_id}` - Returns students enrolled in course
- `GET /get-students-score/{course_id}` - Returns student scores for course

## Notes
- The system uses **"lecturer"** role, not "instructor" role
- Courses are linked to lecturers through the `lecturer_courses` table
- Students are enrolled through the `student_courses` table
- Scores are stored in the `student_exam_scores` table
