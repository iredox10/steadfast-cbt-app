import {  useEffect} from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import {path} from '../utils/path'
import Home from '../src/pages/Home.jsx'
import axios from 'axios'
import Student from './pages/Student.jsx'
import Instructor from './pages/instructor/Instructor.jsx'
import AddQuestion from './pages/instructor/AddQuestion.jsx'
import CourseQuestions from './pages/instructor/CourseQuestions.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminLogin from './pages/admin/Login.jsx'
import AcdSession from './pages/admin/AcdSession.jsx'
import Exams from './pages/instructor/Exams.jsx'
import EditQuestion from './pages/instructor/EditQuestion.jsx'
import InstructorStudents from './pages/instructor/InstructorStudents.jsx'
import AdminInstructiors from './pages/admin/AdminInstructiors.jsx'
import InstructorsCourses from './pages/admin/InstructorsCourses.jsx'
import Session from './pages/admin/Session.jsx'
import Semester from './pages/admin/Semester.jsx'
import StudentSubmission from './pages/StudentSubmission.jsx'
import AdminStudents from './pages/admin/AdminStudents.jsx'
import CourseStudents from './pages/admin/CourseStudents.jsx'
import LoggedStudent from './pages/LoggedStudent.jsx'
import AdminCourses from './pages/admin/AdminCourses.jsx'
import Dashboard from './pages/admin/AdminDashboard.jsx'
import ExamInstructions from './pages/ExamInstructions.jsx'

function App() {
  return (
    <div className=''>
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/student/:studentId' element={<Student />} />
        <Route path='/student-submission/:studentId' element={<StudentSubmission />} />
        <Route path='/logged-student' element={<LoggedStudent />} />


        <Route path='/instructor/:id' element={<Instructor />} />
        <Route path='/exams/:userId/:courseId' element={<Exams />} />
        <Route path='/exam-questions/:userId/:examId' element={<CourseQuestions />} />
        <Route path='/add-question/:questionId/:userId/:examId' element={<AddQuestion />} />
        <Route path='/edit-question/:userId/:questionId' element={<EditQuestion />} />
        <Route path='/instructor-student/:userId/:courseId' element={<InstructorStudents />} />

        <Route path='/admin-dashboard/:id' element={<AdminDashboard />} />
        <Route path='/admin-login' element={<AdminLogin />} />
        <Route path='/admin-sessions' element={<AcdSession />} />
        <Route path='/session/:id' element={<Session />} />
        <Route path='/semester/:id' element={<Semester />} />
        <Route path='/admin-students/:id' element={<AdminStudents />} />
        {/* <Route path='/admin-courses/:id' element={<AdminCourses />} /> */}

        <Route path='/dashboard/:userId' element={<Dashboard />} />
        <Route path='/admin-instructors' element={<AdminInstructiors />} />
        <Route path='/admin-instructor-courses/:id' element={<InstructorsCourses />} />
        <Route path='/add-student-to-course/:id' element={<CourseStudents />} />
        <Route path="/exam-instructions/:studentId" element={<ExamInstructions />} />



        {/* <Route path="/regular/:id" element={<ExamInstructions />} /> */}

      </Routes>
    </Router>
    </div>
  )
}

export default App
