import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { path } from "../utils/path";
import Home from "../src/pages/Home.jsx";
import axios from "axios";
import Student from "./pages/Student.jsx";
import Instructor from "./pages/instructor/Instructor.jsx";
import AddQuestion from "./pages/instructor/AddQuestion.jsx";
import CourseQuestions from "./pages/instructor/CourseQuestions.jsx";
import AdminExam from "./pages/admin/AdminExam.jsx";
import AdminLogin from "./pages/admin/Login.jsx";
import AcdSession from "./pages/admin/AcdSession.jsx";
import Exams from "./pages/instructor/Exams.jsx";
import EditQuestion from "./pages/instructor/EditQuestion.jsx";
import InstructorStudents from "./pages/instructor/InstructorStudents.jsx";
import AdminInstructors from "./pages/admin/Instructors.jsx";
import InstructorsCourses from "./pages/admin/InstructorsCourses.jsx";
import Session from "./pages/admin/Session.jsx";
import Semester from "./pages/admin/Semester.jsx";
import StudentSubmission from "./pages/StudentSubmission.jsx";
import AdminStudents from "./pages/admin/AdminStudents.jsx";
import CourseStudents from "./pages/admin/CourseStudents.jsx";
import LoggedStudent from "./pages/LoggedStudent.jsx";
import AdminCourses from "./pages/admin/AdminCourses.jsx";
import Dashboard from "./pages/admin/AdminDashboard.jsx";
import ExamInstructions from "./pages/ExamInstructions.jsx";
import Invigilator from "./pages/Invigilator.jsx";
import NotCheckIn from "./pages/NotCheckIn.jsx";
import QuestionBank from './pages/instructor/QuestionBank';
import ExamArchives from "./pages/admin/ExamArchives";
import ExamArchiveDetail from "./pages/admin/ExamArchiveDetail";
import AdminManagement from "./pages/admin/AdminManagement";
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";
import DepartmentManagement from "./pages/admin/DepartmentManagement";

function App() {
    return (
        <div className="">
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/student/:studentId" element={<Student />} />
                    <Route
                        path="/student-submission/:studentId"
                        element={<StudentSubmission />}
                    />
                    <Route path="/logged-student" element={<LoggedStudent />} />

                    <Route path="/instructor/:id" element={<Instructor />} />
                    <Route
                        path="/exams/:userId/:courseId"
                        element={<Exams />}
                    />
                    <Route
                        path="/exam-questions/:userId/:courseId/:examId"
                        element={<CourseQuestions />}
                    />
                    <Route
                        path="/add-question/:questionId/:userId/:courseId/:examId"
                        element={<AddQuestion />}
                    />
                    <Route
                        path="/edit-question/:userId/:questionId"
                        element={<EditQuestion />}
                    />
                    <Route
                        path="/instructor-student/:userId/:courseId"
                        element={<InstructorStudents />}
                    />

                    <Route
                        path="/admin-exam/:id"
                        element={<AdminExam />}
                    />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/admin-sessions" element={<AcdSession />} />
                    <Route path="/session/:id" element={<Session />} />
                    <Route path="/semester/:id" element={<Semester />} />
                    <Route
                        path="/admin-students/:id"
                        element={<AdminStudents />}
                    />
                    {/* <Route path='/admin-courses/:id' element={<AdminCourses />} /> */}

                    <Route path="/dashboard/:userId" element={<Dashboard />} />
                    <Route
                        path="/admin-instructors"
                        element={<AdminInstructors />}
                    />
                    <Route
                        path="/admin-instructor-courses/:id"
                        element={<InstructorsCourses />}
                    />
                    <Route
                        path="/add-student-to-course/:id"
                        element={<CourseStudents />}
                    />
                    <Route
                        path="/exam-instructions/:studentId"
                        element={<ExamInstructions />}
                    />

                    <Route path="/invigilator/:id" element={<Invigilator />} />

                    <Route path="/not-check-in" element={<NotCheckIn />} />

                    <Route path="/question-bank/:userId" element={<QuestionBank />} />

                    <Route path="/exam-archives" element={<ExamArchives />} />
                    <Route path="/exam-archives/:archiveId" element={<ExamArchiveDetail />} />

                    <Route path="/admin-management" element={<AdminManagement />} />
                    <Route path="/admin-dashboard/:userId" element={<SuperAdminDashboard />} />
                    <Route path="/department-management" element={<DepartmentManagement />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
