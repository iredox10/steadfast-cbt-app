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
import Footer from './components/Footer.jsx'
import AcdSession from './pages/admin/AcdSession.jsx'
import Exams from './pages/instructor/Exams.jsx'
import EditQuestion from './pages/instructor/EditQuestion.jsx'
import InstructorStudents from './pages/instructor/InstructorStudents.jsx'

function App() {
  return (
    <div className=''>
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/student/:studentId' element={<Student />} />


        <Route path='/instructor/:id' element={<Instructor />} />
        <Route path='/exams/:userId/:courseId' element={<Exams />} />
        <Route path='/exam-questions/:userId/:examId' element={<CourseQuestions />} />
        <Route path='/add-question/:questionId/:userId/:examId' element={<AddQuestion />} />
        <Route path='/edit-question/:userId/:questionId' element={<EditQuestion />} />
        <Route path='/instructor-student/:userId/:courseId' element={<InstructorStudents />} />


        <Route path='/admin-dashboard' element={<AdminDashboard />} />
        <Route path='/admin-login' element={<AdminLogin />} />
        <Route path='/admin-session' element={<AcdSession />} />
        <Route path='/admin-courses' element={<AcdSession />} />
        <Route path='/admin-instructors' element={<AcdSession />} />

      </Routes>
    </Router>
    </div>
  )
}

export default App
