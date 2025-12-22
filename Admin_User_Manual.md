# BUK CBT - Administrator User Manual

Welcome, Administrator. This guide covers the full range of administrative functions available in the BUK CBT platform. Your role is central to managing the entire examination ecosystem, from setting up academic years to managing users and system-wide settings.

The system has different levels of administrators. This guide will specify which roles can perform certain actions.

**Administrator Roles:**
-   **Admin:** The base administrator role with broad access.
-   **Level Admin:** An administrator whose permissions are scoped to a specific department or academic level (e.g., "100 Level"). They can only manage courses, instructors, and students within their assigned level.
-   **Super Admin:** The highest-level administrator with unrestricted access to all system settings and user management.

---

## 1. Dashboard
Your dashboard provides a high-level overview of the system, including:
-   Total number of students, instructors, and courses.
-   Active academic sessions.
-   Recent exam submissions and upcoming exams.

---

## 2. Academic & Course Management

### 2.1. Managing Academic Sessions (Super/Level Admin)
An "Academic Session" (e.g., "2024/2025") is the top-level container for all academic activities.
1.  **Create a Session:** Navigate to `Academic Sessions` and create a new session.
2.  **Activate a Session:** You must activate a session to make it the current operational year. Only one session can be active at a time.
3.  **Manage Semesters:** Within a session, you can create semesters (e.g., "First Semester", "Second Semester"). You must also activate the current semester.

### 2.2. Managing Departments/Levels (Super Admin)
-   Super Admins can create and manage departments (also referred to as "Levels," e.g., "100 Level Computer Science").
-   These levels are used to scope the permissions for Level Admins.

### 2.3. Managing Courses (All Admins)
1.  **Create a Course:** Navigate to the active Semester and select "Add Course." Provide the course title, code, and credit units. Level Admins can only create courses within their assigned level.
2.  **Import Courses:** You can bulk-import courses from an Excel file. A downloadable template is provided.
3.  **Assign Courses to Lecturers:**
    -   Navigate to the `Instructors` page.
    -   Select an instructor and choose "Assign Course."
    -   Pick a course from the list of available (unassigned) courses.
    -   Level Admins can only assign courses they created to instructors within their level.

---

## 3. User Management (All Admins)

### 3.1. Managing Students
-   **Register a Student:** Manually register a new student by providing their full name, candidate number, department, programme, and an optional photo.
-   **Import Students:** Bulk-register students by uploading an Excel file. A template is provided in the "Import Students" modal.
-   **View/Edit Students:** View the list of all students (filtered by level for Level Admins). You can edit a student's details or update their photo.
-   **Enroll Students in a Course:** Navigate to a course and select "Enroll Students". You can enroll students individually or in bulk by their academic level.

### 3.2. Managing Instructors (Lecturers)
-   **Register an Instructor:** Manually add a new instructor by providing their name and email. A default password will be set.
-   **Import Instructors:** Bulk-register instructors via an Excel file upload.
-   **Update Status:** You can activate or deactivate an instructor's account.

### 3.3. Managing Administrators (Super Admin Only)
-   Super Admins can create, edit, and delete other admin accounts.
-   When creating an admin, you can assign them the role of `Super Admin` or `Level Admin`.
-   If creating a `Level Admin`, you must assign them to a specific department/level.

---

## 4. Exam Management (All Admins)

### 4.1. Activating an Exam
Once an instructor has created an exam and added questions, an administrator must activate it.
1.  Navigate to the `Exams` list.
2.  Find the exam you wish to start and click **"Activate"**.
3.  **Assign an Invigilator:** You must select an available invigilator from the list. An invigilator cannot be assigned to more than one active exam at a time.
4.  Activating the exam generates the unique **Exam Tickets** required for student login.

### 4.2. Monitoring an Active Exam
-   From the dashboard or `Exams` page, you can view the status of active exams.
-   **View Tickets:** See the status of all generated tickets (Available vs. Used).
-   **Manage Students:** As an admin, you can also perform invigilator actions like extending time for a student.

### 4.3. Terminating an Exam
Once the exam period is over, it must be terminated.
1.  Find the active exam in the list.
2.  Click **"Terminate"**.
3.  This action will:
    -   Force-submit any ongoing student sessions.
    -   Calculate and save final scores.
    -   Move the exam data to the **Exam Archives**.
    -   Delete all tickets for the session.

### 4.4. Viewing Exam Archives
-   Navigate to `Exam Archives` to see the results and details of all past exams.
-   You can drill down into an archive to see a complete list of students who took the exam and their final scores.

---

## 5. System Configuration (Super Admin Only)

Super Admins have access to the `Settings` page, which allows for global configuration of the CBT platform.
-   **Student Result Visibility:** Choose whether students can see their results immediately after submission.
-   **Student Registration:** Enable or disable public-facing student registration.
-   **Exam Security Settings:** Globally enable or disable security features like:
    -   Fullscreen lockdown.
    -   Copy/paste blocking.
    -   Tab switch detection.
    -   The maximum number of violations allowed before auto-submission.

---
*This manual provides a comprehensive guide to your administrative duties. Please perform your tasks with care, as many actions (like terminating an exam) have significant consequences.*