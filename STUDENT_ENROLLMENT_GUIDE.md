# Student Enrollment Guide

## Overview
The Student Enrollment system allows admins to manage which students are enrolled in specific courses. This is essential for ensuring that only the relevant students receive exam tickets when an exam is activated.

## Accessing the Enrollment Page

### Option 1: Direct URL
Navigate to: `/student-enrollment/{courseId}`

Example: `/student-enrollment/4`

### Option 2: From Course Management
1. Go to the Courses page
2. Find the course you want to manage
3. Click the "Manage Enrollment" or "Enroll Students" button

## Features

### 1. **View Enrolled Students**
- See all students currently enrolled in the course
- Search enrolled students by name, ID, or department
- View student details including profile picture, name, candidate number, and department
- **Unenroll students**: Click the trash icon next to any enrolled student to remove them from the course

### 2. **View Available Students**
- See all students who are not yet enrolled in the course
- Search available students by name, ID, or department
- Select individual students or use "Select All" to choose multiple students at once
- Selected students are highlighted with a blue background

### 3. **Enroll Students (Individual Selection)**
1. Browse the "Available Students" list on the left side
2. Click on individual students to select them (or use the checkbox)
3. Use "Select All" to select all filtered students at once
4. Click the "Enroll Selected" button at the top right
5. Selected students will be moved to the "Enrolled Students" list

### 4. **Quick Enroll by Level/Department**
This feature allows you to enroll ALL students from a specific department at once:

1. Look for the blue info box at the top of the page
2. Select a level/department from the dropdown menu
3. Click "Enroll Level"
4. All students from that department will be automatically enrolled

**Use Case Example**: If you have a Mechanical Engineering course and want to enroll all Mechanical Engineering students at once, simply:
- Select "Mechanical Engineering" (or the corresponding level)
- Click "Enroll Level"
- Done! All Mechanical Engineering students are now enrolled

### 5. **Real-time Statistics**
At the top of the page, you'll see three cards showing:
- **Enrolled Students**: Total number of students currently enrolled
- **Available Students**: Number of students available to enroll
- **Selected to Enroll**: Number of students currently selected (before clicking enroll)

## Important Notes

### Relationship to Exam Tickets
- **Only enrolled students will receive exam tickets** when you activate an exam
- If students are showing "Not generated" in the invigilator page, check if they are enrolled in the course
- Department-based filtering: If an exam is for Level 6 (Mechanical Engineering), only enrolled students from Level 6 will get tickets

### Best Practices
1. **Enroll students before activating exams**: Make sure all relevant students are enrolled before you activate an exam
2. **Use level-based enrollment for efficiency**: If all students from a department should take the course, use the "Quick Enroll by Level" feature
3. **Regular audits**: Periodically review enrolled students to ensure the list is up-to-date
4. **Remove graduates**: Unenroll students who have completed the course or withdrawn

### Troubleshooting

**Problem**: Students don't have exam tickets
**Solution**: 
1. Check if they are enrolled in the course using this enrollment page
2. If not enrolled, enroll them
3. Either reactivate the exam or have the invigilator manually generate their tickets

**Problem**: Too many students enrolled
**Solution**: Use the search feature to find specific students, then click the trash icon to unenroll them

**Problem**: Need to enroll many students at once
**Solution**: Use the "Quick Enroll by Level" feature instead of selecting individually

## Permissions
- **Super Admins**: Can enroll students in any course
- **Level Admins**: Can only enroll students from their assigned department/level

## Technical Details

### Backend Endpoints Used
- `POST /api/enroll-students` - Enroll selected students
- `POST /api/unenroll-student` - Remove a student from the course
- `GET /api/unenrolled-students/{courseId}` - Get students not enrolled in the course
- `POST /api/enroll-students-by-level` - Enroll all students from a specific level
- `GET /api/get-course-students/{courseId}` - Get currently enrolled students

### Database Tables
- `student_courses` - Stores the enrollment relationships between students and courses
- `students` - Contains student information
- `courses` - Contains course information

## Future Enhancements (Planned)
- Bulk import/export of enrollments via CSV
- Enrollment history tracking
- Automatic enrollment based on student year/program
- Email notifications when enrolled/unenrolled
