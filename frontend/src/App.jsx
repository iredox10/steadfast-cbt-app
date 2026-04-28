import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams } from "react-router-dom";
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
import WaitingRoom from "./pages/WaitingRoom.jsx";
import Invigilator from "./pages/Invigilator.jsx";
import InvigilatorSettings from "./pages/InvigilatorSettings.jsx";
import NotCheckIn from "./pages/NotCheckIn.jsx";
import QuestionBank from './pages/instructor/QuestionBank';
import ExamArchives from "./pages/admin/ExamArchives";
import ExamArchiveDetail from "./pages/admin/ExamArchiveDetail";
import AdminManagement from "./pages/admin/AdminManagement";
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";
import DepartmentManagement from "./pages/admin/DepartmentManagement";
import GlobalSessionManagement from "./pages/admin/GlobalSessionManagement";
import LevelAdminCourseManagement from "./pages/admin/LevelAdminCourseManagement";
import StudentEnrollment from "./pages/admin/StudentEnrollment";
import Tickets from "./pages/admin/Tickets";
import Settings from "./pages/admin/Settings";
import InstructorDashboard from "./pages/instructor/Dashboard";
import CourseResults from "./pages/instructor/CourseResults";
import ExamResultsDetail from "./pages/instructor/ExamResultsDetail";
import StudentResult from "./pages/StudentResult";
import NotFound from "./pages/NotFound";
import UserManual from "./pages/UserManual";
import FacultyManagement from "./pages/admin/FacultyManagement";
import SessionTimeout from "./components/SessionTimeout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <div className="">
            <Router>
                <SessionTimeout timeoutInMinutes={30} />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/student/:studentId" element={<Student />} />
                    <Route
                        path="/student-submission/:studentId"
                        element={<StudentSubmission />}
                    />
                    <Route path="/student-result/:studentId" element={<StudentResult />} />
                    <Route path="/logged-student" element={<LoggedStudent />} />

                    <Route path="/manual/:role" element={<UserManual />} />

                    {/* Protected Instructor Routes */}
                    <Route path="/instructor/:id" element={<InstructorRedirect />} />
                    <Route path="/instructor/dashboard/:id" element={<ProtectedRoute><InstructorDashboard /></ProtectedRoute>} />
                    <Route path="/course-results/:userId/:courseId" element={<ProtectedRoute><CourseResults /></ProtectedRoute>} />
                    <Route path="/exam-results-detail/:userId/:courseId/:examId" element={<ProtectedRoute><ExamResultsDetail /></ProtectedRoute>} />
                    <Route
                        path="/exams/:userId/:courseId"
                        element={<ProtectedRoute><Exams /></ProtectedRoute>}
                    />
                    <Route
                        path="/exam-questions/:userId/:courseId/:examId"
                        element={<ProtectedRoute><CourseQuestions /></ProtectedRoute>}
                    />
                    <Route
                        path="/add-question/:questionId/:userId/:courseId/:examId"
                        element={<ProtectedRoute><AddQuestion /></ProtectedRoute>}
                    />
                    <Route
                        path="/edit-question/:userId/:questionId"
                        element={<ProtectedRoute><EditQuestion /></ProtectedRoute>}
                    />
                    <Route
                        path="/instructor-student/:userId/:courseId"
                        element={<ProtectedRoute><InstructorStudents /></ProtectedRoute>}
                    />

                    {/* Protected Admin Routes */}
                    <Route
                        path="/admin-exam/:id"
                        element={<ProtectedRoute><AdminExam /></ProtectedRoute>}
                    />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/admin-sessions" element={<ProtectedRoute><AcdSession /></ProtectedRoute>} />
                    <Route path="/session/:id" element={<ProtectedRoute><Session /></ProtectedRoute>} />
                    <Route path="/semester/:id" element={<ProtectedRoute><Semester /></ProtectedRoute>} />
                    <Route
                        path="/admin-students/:id"
                        element={<ProtectedRoute><AdminStudents /></ProtectedRoute>}
                    />

                    <Route path="/dashboard/:userId" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route
                        path="/admin-instructors/:userId"
                        element={<ProtectedRoute><AdminInstructors /></ProtectedRoute>}
                    />
                    <Route
                        path="/admin-instructor-courses/:id"
                        element={<ProtectedRoute><InstructorsCourses /></ProtectedRoute>}
                    />
                    <Route
                        path="/assign-courses/:id"
                        element={<ProtectedRoute><InstructorsCourses /></ProtectedRoute>}
                    />
                    <Route
                        path="/add-student-to-course/:id"
                        element={<ProtectedRoute><CourseStudents /></ProtectedRoute>}
                    />
                    <Route
                        path="/exam-instructions/:studentId"
                        element={<ExamInstructions />}
                    />
                    <Route
                        path="/waiting-room/:studentId"
                        element={<WaitingRoom />}
                    />

                    {/* Protected Invigilator Routes */}
                    <Route path="/invigilator/:id" element={<ProtectedRoute><Invigilator /></ProtectedRoute>} />
                    <Route path="/invigilator-settings/:id" element={<ProtectedRoute><InvigilatorSettings /></ProtectedRoute>} />

                    <Route path="/not-check-in" element={<NotCheckIn />} />

                    <Route path="/question-bank/:userId" element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />

                    <Route path="/exam-archives" element={<ProtectedRoute><ExamArchives /></ProtectedRoute>} />
                    <Route path="/exam-archives/:archiveId" element={<ProtectedRoute><ExamArchiveDetail /></ProtectedRoute>} />
                    <Route path="/exam-archive-detail/:userId/:archiveId" element={<ProtectedRoute><ExamArchiveDetail /></ProtectedRoute>} />

                    <Route path="/admin-management" element={<ProtectedRoute><AdminManagement /></ProtectedRoute>} />
                    <Route path="/admin-dashboard/:userId" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
                    <Route path="/department-management" element={<ProtectedRoute><DepartmentManagement /></ProtectedRoute>} />
                    <Route path="/faculty-management" element={<ProtectedRoute><FacultyManagement /></ProtectedRoute>} />
                    <Route path="/global-session-management" element={<ProtectedRoute><GlobalSessionManagement /></ProtectedRoute>} />
                    <Route path="/level-admin-courses" element={<ProtectedRoute><LevelAdminCourseManagement /></ProtectedRoute>} />
                    <Route path="/student-enrollment/:courseId" element={<ProtectedRoute><StudentEnrollment /></ProtectedRoute>} />
                    <Route path="/admin-tickets/:id" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
                    <Route path="/admin-settings/:userId" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                    {/* 404 - Catch all unmatched routes */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </div>
    );
}

const InstructorRedirect = () => {
    const { id } = useParams();
    return <Navigate to={`/instructor/dashboard/${id}`} replace />;
};

export default App;
