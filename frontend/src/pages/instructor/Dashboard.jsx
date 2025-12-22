import React from "react";
import { Link, useParams } from "react-router-dom";
import { FaBook, FaQuestionCircle, FaUsers, FaFileAlt, FaChartBar, FaTachometerAlt } from "react-icons/fa";
import useFetch from "../../hooks/useFetch";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { path } from "../../../utils/path";

const Dashboard = () => {
    const { id } = useParams();
    
    const { data: user, loading: userLoading } = useFetch(`/get-user/${id}`);
    const { data: courses } = useFetch(`/get-lecturer-courses/${id}`);
    const [stats, setStats] = React.useState({
        totalCourses: 0,
        activeExams: 0,
        totalQuestions: 0,
        totalStudents: 0,
        loading: true
    });

    React.useEffect(() => {
        if (courses && courses.length > 0) {
            fetchInstructorStats();
        } else if (courses) {
            setStats({
                totalCourses: 0,
                activeExams: 0,
                totalQuestions: 0,
                totalStudents: 0,
                loading: false
            });
        }
    }, [courses, id]);

    const fetchInstructorStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            let totalActiveExams = 0;
            let totalQuestions = 0;
            let totalStudents = 0;

            for (const course of courses) {
                try {
                    const examsRes = await axios.get(`${path}/get-exams/${id}/${course.course_id}`, { headers });
                    const exams = Array.isArray(examsRes.data) ? examsRes.data : [];
                    
                    const activeExams = exams.filter(exam => 
                        exam.activated === 'yes'
                    );
                    totalActiveExams += activeExams.length;

                    for (const exam of exams) {
                        try {
                            const questionsRes = await axios.get(`${path}/get-questions/${exam.id}`, { headers });
                            const questions = Array.isArray(questionsRes.data) ? questionsRes.data : [];
                            totalQuestions += questions.length;
                        } catch (err) {
                            console.log(`Failed to fetch questions for exam ${exam.id}`);
                        }
                    }

                    try {
                        const studentsRes = await axios.get(`${path}/get-students/${id}/${course.course_id}`, { headers });
                        const students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
                        totalStudents += students.length;
                    } catch (err) {
                        console.log(`Failed to fetch students for course ${course.course_id}`);
                    }
                } catch (err) {
                    console.log(`Failed to fetch data for course ${course.course_id}`);
                }
            }

            setStats({
                totalCourses: courses.length,
                activeExams: totalActiveExams,
                totalQuestions: totalQuestions,
                totalStudents: totalStudents,
                loading: false
            });
        } catch (error) {
            console.error("Error fetching instructor stats:", error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    const statsDisplay = [
        { title: "Total Courses", value: stats.totalCourses, icon: <FaBook />, color: "bg-blue-100 text-blue-500" },
        { title: "Total Questions", value: stats.totalQuestions, icon: <FaQuestionCircle />, color: "bg-green-100 text-green-500" },
        { title: "Active Exams", value: stats.activeExams, icon: <FaFileAlt />, color: "bg-yellow-100 text-yellow-500" },
        { title: "Total Students", value: stats.totalStudents, icon: <FaUsers />, color: "bg-purple-100 text-purple-500" },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <Sidebar>
                <Link
                    to={`/instructor/dashboard/${id}`}
                    className="flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg transition-colors duration-200"
                >
                    <FaTachometerAlt />
                    <span>Dashboard</span>
                </Link>
                <Link
                    to={`/instructor/${id}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaBook />
                    <span>Courses</span>
                </Link>
                <Link
                    to="/manual/instructor"
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaQuestionCircle />
                    <span>User Manual</span>
                </Link>
            </Sidebar>
            
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {user?.full_name || 'Instructor'}!
                        </h1>
                        <p className="text-gray-600 mt-1">Here's what's happening with your courses today.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors">
                            <i className="fas fa-bell text-gray-600"></i>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <i className="fas fa-user text-blue-600"></i>
                            </div>
                            <span className="font-medium text-gray-900">{user?.full_name || 'Instructor'}</span>
                        </div>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsDisplay.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                            <div className={`p-4 rounded-full ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {stats.loading ? (
                                        <span className="text-gray-400">...</span>
                                    ) : (
                                        stat.value
                                    )}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Courses Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Your Courses</h2>
                        <Link to={`/instructor/${id}`} className="text-blue-500 hover:text-blue-700 font-medium">
                            View All Courses
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses && courses.slice(0, 3).map((course) => (
                            <Link 
                                key={course.course_id} 
                                to={`/exams/${id}/${course.course_id}`}
                                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer block"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FaBook className="text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                                        <p className="text-sm text-gray-600">{course.code}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Click to view</span>
                                    <span className="text-blue-500">→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;