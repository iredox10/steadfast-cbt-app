# BUK CBT Application - User Guide

Welcome to the BUK Computer Based Test (CBT) User Guide. This system is designed to manage the entire examination lifecycle, from student registration to result processing, with a strong focus on security and ease of use.

---

## Table of Contents
1. [For Super Admins](#1-super-admin-guide)
2. [For Level/Session Admins](#2-level-admin-session-admin-guide)
3. [For Instructors/Lecturers](#3-instructor-guide)
4. [For Invigilators](#4-invigilator-guide)
5. [For Students](#5-student-guide)
6. [Exam Security Features](#6-exam-security-features)

---

## 1. Super Admin Guide
**Role:** System Owner. Has full access to all settings and data across all departments/sessions.

*   **System Settings:**
    *   Navigate to **Settings** to configure global behaviors.
    *   **Student Registration:** Enable/Disable new sign-ups.
    *   **Show Results:** Toggle whether students see their scores immediately after submission.
    *   **Security:** Configure Browser Lockdown rules (Fullscreen, Tab switching detection, Copy/Paste blocking) and set the **Max Violations** allowed before auto-submission.
*   **Manage Admins:** Create Level Admins and assign them to specific Departments/Sessions.
*   **Departments:** Create and manage academic sessions or departments.

## 2. Level Admin (Session Admin) Guide
**Role:** Manages students and courses within a specific Department or Academic Session.

*   **Student Management:**
    *   **Register Students:** Manually add students or use the **Import Excel** feature for bulk upload.
    *   **Edit Students:** Click the **Edit (Pencil)** icon to update student details or upload/change their profile photo.
    *   **Extend Time:** If an exam is active (or recently terminated), use the **Extend Time** button next to a student to grant extra minutes. This effectively "resumes" a student if they were logged out or lets them continue after time expired.
*   **Course Management:**
    *   Create courses for your level.
    *   Assign courses to Lecturers/Instructors.
    *   **Enrollment:** Manage which students are enrolled in specific courses.

## 3. Instructor Guide
**Role:** Creates exams, manages questions, and views results.

*   **Creating Exams:**
    *   Go to the **Exams** page for your course.
    *   Click **Add Exam**.
    *   **Total Questions (Pool Size):** The total number of questions available in the bank.
    *   **Questions to Answer:** The actual number of questions a student will face (randomly selected from the pool).
    *   **Settings:** Set duration, marks per question, and type (School/External).
*   **Managing Exams:**
    *   **Edit:** You can edit exam details as long as it hasn't been terminated.
    *   **Submit:** Send the exam to the Admin/System for activation.
    *   **Recall:** If you submitted an exam but need to make changes (and it hasn't started yet), use the **Recall** button to revert it to draft mode.
*   **Question Bank:**
    *   Add questions manually or bulk upload via Excel.
    *   Supports rich text questions.
*   **Results:**
    *   View detailed results for current and past exams.
    *   Results show **Score (Rounded) / Total Questions**.
    *   Export results to **PDF** or **Excel**.

## 4. Invigilator Guide
**Role:** Verifies student identity and manages the exam hall entry.

*   **Check-In Process:**
    1.  Search for the student by **Name** or **Candidate Number**.
    2.  **Verify Identity:** Click the student's photo to enlarge it. Physically verify the student's face matches the system photo.
    3.  **Confirm Ticket:** Ensure the student has their valid exam ticket (if applicable).
    4.  Click **VERIFY & CHECK IN**. The system will mark them as present.
*   **Monitoring:**
    *   The dashboard shows real-time stats: Total Students, Pending, and Checked-in.
    *   Students cannot log in to the exam unless they have been checked in by you.

## 5. Student Guide
**Role:** The examinee.

*   **Login:**
    *   Enter your **Candidate Number** and **Ticket Number** to log in.
    *   *Note:* You must be checked in by an invigilator first.
*   **Taking the Exam:**
    *   **Security:** The browser will force Fullscreen mode. Do not attempt to switch tabs or exit fullscreen, or you will record a **Violation**.
    *   **Navigation:** Use the **Next** and **Previous** buttons at the bottom of the card to move between questions.
    *   **Shortcuts:** You can press keys `1`, `2`, `3`, `4` to select options A, B, C, D respectively.
*   **Submission:**
    *   The **Submit Exam** button is located at the **top right** of the question area.
    *   Once submitted, you may see your result slip immediately (if enabled by admin), showing your Score and Course details.
    *   **Note:** You cannot go back to the exam after seeing the result slip.

## 6. Exam Security Features
This app enforces strict security to maintain exam integrity:

1.  **Browser Lockdown:**
    *   Forces Fullscreen mode.
    *   Blocks Right-Click, Copy, Paste, and Cut.
    *   Detects Tab Switching or Window blurring.
2.  **Violation Tracking:**
    *   The system logs every security breach (e.g., trying to open Google in another tab).
    *   If a student exceeds the **Max Violations** limit (default is usually 3), the system will **automatically submit** their exam.
3.  **Fresh Start vs. Resume:**
    *   If an exam is terminated and re-activated, students start **fresh** (answers are reset).
    *   Students only **resume** where they left off if the Admin explicitly grants a **Time Extension** for them.
