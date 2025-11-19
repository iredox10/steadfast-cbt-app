import { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell } from 'docx';
import * as fs from 'fs';

// Create the document
const doc = new Document({
    sections: [{
        properties: {},
        children: [
            new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [
                    new TextRun({
                        text: 'CBT Application Documentation for End Users',
                        bold: true,
                        size: 28
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Overview',
                        bold: true,
                        size: 24
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'The Computer-Based Testing (CBT) application is a comprehensive examination management system developed for BUK KANO. It enables secure online testing with multiple user roles, including students, instructors, administrators, and invigilators. The system ensures secure exam delivery, proper student authentication, and comprehensive exam management.'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'User Roles and Responsibilities',
                        bold: true,
                        size: 24
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '1. Student User Experience',
                        bold: true,
                        size: 20
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Accessing the System:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Students access the system through the home page'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Login requires two credentials:'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '  - Candidate Number: Your unique identification number provided by your institution'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '  - Ticket Number: A secret code provided by the examination authority'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Pre-Exam Process:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '1. Check-in Requirement: Students must be physically checked in by an invigilator before accessing the exam'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '2. Identity Verification: The invigilator must verify your identity before granting access'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '3. No Check-in Notice: If you attempt to login without being checked in, you will be redirected to a "Not Checked In" page'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Exam Interface:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '1. Navigation Panel: Shows all questions with color-coded indicators'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Unanswered questions appear in gray'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Answered questions appear in green'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Current question appears in blue'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '2. Question Features:'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Multiple-choice questions with options A, B, C, D'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Options are shuffled for security'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Navigation between questions using "Next" and "Previous" buttons'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Keyboard shortcuts (1-4 for options, arrow keys for navigation)'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '3. Timer Display:'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Countdown timer shows remaining exam time'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Shows any time extensions granted'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Automatically submits exam when time runs out'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '4. Answering Questions:'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Select an answer by clicking on the option'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Answers are saved automatically to local storage'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Can navigate freely between questions'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Each question can be answered only once and saved'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Submitting the Exam:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Click the "Submit Exam" button when finished'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Confirm submission in the pop-up dialog'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- After submission, you\'ll be redirected to a submission confirmation page'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Your answers are permanently recorded in the system'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '2. Instructor User Experience',
                        bold: true,
                        size: 20
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Dashboard Overview:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Access courses assigned by administrators'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- View statistics: number of courses, active exams, total questions, and students'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Quick access to question banks and exam management'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Course Management:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '1. View Assigned Courses: Access all courses assigned by the administrator'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '2. Add Questions: Navigate to "Question Bank" to add questions to your course'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '3. Create Exams: Manage exams for your assigned courses'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '4. Manage Students: View and manage students enrolled in your courses'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '5. View Results: Access student performance and exam results'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Question Bank Management:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Add new questions with multiple options'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Edit existing questions'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Categorize questions by topic or type'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Preview questions before adding to exams'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '3. Administrator User Experience',
                        bold: true,
                        size: 20
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Admin Dashboard:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- View system-wide statistics (total students, active courses, instructors)'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Monitor upcoming exams and recent submissions'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Manage user accounts and permissions'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'User Management:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Student Management: Add, edit, or remove student accounts'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Instructor Management: Add, assign courses, and manage instructor accounts'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Invigilator Management: Assign invigilators to exams and sessions'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Course and Exam Management:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Create and manage courses'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Assign instructors to courses'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Create and activate exams'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Set exam parameters (duration, marks per question)'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Monitor exam status and results'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Academic Session Management:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Create academic sessions (semesters)'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Manage department assignments'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Control global session settings'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Handle ticket management for exams'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '4. Invigilator User Experience',
                        bold: true,
                        size: 20
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Pre-Exam Setup:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Access assigned exam and course information'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- View exam duration, title, and activation date'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- See list of students enrolled in the exam'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Student Check-in Process:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '1. Student Verification: Physical identity verification required'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Check student photo against records'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Verify student is on the enrollment list'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '2. Check-in Action:'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Search students by name or candidate number'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Filter by check-in status'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Click "Check-in Student" button after verification'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - System confirms successful check-in with notification'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '3. Student List Management:'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Real-time student status display'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Visual indicators (gray for pending, green for checked-in)'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - View student photos by clicking on image icons'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '   - Filter students by status (all, pending, checked-in)'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'System Access:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Students can only access exams after being checked in by an invigilator'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Invigilators must ensure all students are properly verified before check-in'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- System tracks check-in times for accountability'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Getting Started Guide',
                        bold: true,
                        size: 24
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'For Students:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '1. Navigate to the CBT portal'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '2. Have your candidate number and ticket number ready'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '3. Wait for invigilator to physically verify your identity'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '4. Once checked in by the invigilator, login using your credentials'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '5. Read exam instructions carefully before starting'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '6. Answer questions and make sure to submit before time expires'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'For Instructors:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '1. Login with your instructor credentials'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '2. Access your assigned courses from the dashboard'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '3. Use the navigation sidebar to access question banks, exams, and students'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '4. Create or edit questions as needed'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '5. Monitor student progress and exam results'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'For Administrators:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '1. Login to the admin panel'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '2. Access student, instructor, and course management'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '3. Create academic sessions and assign courses'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '4. Monitor overall system performance'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '5. Handle user access and permissions'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'For Invigilators:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '1. Login using your invigilator account'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '2. View the assigned exam and course details'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '3. Verify the student list before exam begins'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '4. Physically verify each student\'s identity'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '5. Check students in using the invigilator panel'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Troubleshooting Common Issues',
                        bold: true,
                        size: 24
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Student Login Issues:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- If you can\'t login, ensure you\'ve been checked in by the invigilator'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Verify your candidate number and ticket number are correct'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Contact your invigilator if you\'re sure you\'ve been checked in'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Exam Issues:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Answers are saved automatically, but ensure you submit before time expires'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- If you lose internet connection, answers remain in local storage'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Refresh the page if the interface becomes unresponsive'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Technical Support:',
                        bold: true,
                        size: 16
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Use the support button on the home page'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Contact your institution\'s IT department'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '- Ensure you\'re using a compatible browser (Chrome, Firefox, Safari, Edge)'
                    })
                ]
            })
        ]
    }]
});

// Create the .docx file
import { Packer } from 'docx';

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync('CBT_User_Documentation.docx', buffer);
    console.log('Document created successfully!');
});