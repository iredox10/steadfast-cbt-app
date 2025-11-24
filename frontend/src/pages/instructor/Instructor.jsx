import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { path } from "../../../utils/path";
import {
    FaBook,
    FaChalkboardTeacher,
    FaUsers,
    FaQuestionCircle,
    FaFileAlt,
    FaChartBar,
    FaTachometerAlt
} from "react-icons/fa";

const Instructor = () => {
    const { id } = useParams();
    const [courses, setCourses] = useState([]);
    const [coursesWithStats, setCoursesWithStats] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userLoading, setUserLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [userErr, setUserErr] = useState(null);
    const [stats, setStats] = useState({
        totalCourses: 0,
        activeExams: 0,
        totalQuestions: 0,
        totalStudents: 0
    });

    useEffect(() => {
        const fetchInstructorData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch current user info
                setUserLoading(true);
                const userRes = await axios.get(`${path}/user`, { headers });
                setUser(userRes.data);
                setUserLoading(false);

                // Fetch instructor's assigned courses
                setLoading(true);
                console.log('Fetching courses for instructor ID:', id);
                const coursesRes = await axios.get(`${path}/get-lecturer-courses/${id}`, { headers });
                console.log('Instructor courses response:', coursesRes.data);
                
                // Ensure courses is always an array
                const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data : [];
                setCourses(coursesData);

                // Fetch statistics for assigned courses
                await fetchInstructorStats(coursesData, headers);
                
                // Fetch individual course stats
                await fetchCourseStats(coursesData, headers);
                
                setLoading(false);

            } catch (error) {
                console.error("Error fetching instructor data:", error);
                if (error.response?.status === 401) {
                    setUserErr("Authentication failed. Please log in again.");
                } else {
                    const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load data";
                    setErr(typeof errorMessage === 'string' ? errorMessage : "Failed to load courses");
                }
                setLoading(false);
                setUserLoading(false);
            }
        };

        if (id) {
            fetchInstructorData();
        }
    }, [id]);

    const fetchInstructorStats = async (coursesData, headers) => {
        try {
            let totalActiveExams = 0;
            let totalQuestions = 0;
            let totalStudents = 0;

            // Fetch stats for each assigned course
            for (const course of coursesData) {
                try {
                    // Fetch exams for this course
                    const examsRes = await axios.get(`${path}/get-exams/${id}/${course.course_id}`, { headers });
                    const exams = Array.isArray(examsRes.data) ? examsRes.data : [];
                    
                    // Count active exams (activated = 'yes')
                    const activeExams = exams.filter(exam => 
                        exam.activated === 'yes'
                    );
                    totalActiveExams += activeExams.length;

                    // Count total questions across all exams
                    for (const exam of exams) {
                        try {
                            const questionsRes = await axios.get(`${path}/get-questions/${exam.id}`, { headers });
                            const questions = Array.isArray(questionsRes.data) ? questionsRes.data : [];
                            totalQuestions += questions.length;
                        } catch (err) {
                            console.log(`Failed to fetch questions for exam ${exam.id}`);
                        }
                    }

                    // Fetch students enrolled in this course
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
                totalCourses: coursesData.length,
                activeExams: totalActiveExams,
                totalQuestions: totalQuestions,
                totalStudents: totalStudents
            });
        } catch (error) {
            console.error("Error fetching instructor stats:", error);
        }
    };

    const fetchCourseStats = async (coursesData, headers) => {
        try {
            const coursesWithStatsData = await Promise.all(
                coursesData.map(async (course) => {
                    try {
                        // Fetch exams for this course
                        const examsRes = await axios.get(`${path}/get-exams/${id}/${course.course_id}`, { headers });
                        const exams = Array.isArray(examsRes.data) ? examsRes.data : [];
                        
                        // Check for active exams (activated = 'yes')
                        const hasActiveExam = exams.some(exam => 
                            exam.activated === 'yes'
                        );

                        // Count total questions
                        let totalQuestions = 0;
                        for (const exam of exams) {
                            try {
                                const questionsRes = await axios.get(`${path}/get-questions/${exam.id}`, { headers });
                                const questions = Array.isArray(questionsRes.data) ? questionsRes.data : [];
                                totalQuestions += questions.length;
                            } catch (err) {
                                console.log(`Failed to fetch questions for exam ${exam.id}`);
                            }
                        }

                        return {
                            ...course,
                            examCount: exams.length,
                            questionCount: totalQuestions,
                            hasActiveExam: hasActiveExam
                        };
                    } catch (err) {
                        console.log(`Failed to fetch stats for course ${course.course_id}`);
                        return {
                            ...course,
                            examCount: 0,
                            questionCount: 0,
                            hasActiveExam: false
                        };
                    }
                })
            );
            
            setCoursesWithStats(coursesWithStatsData);
        } catch (error) {
            console.error("Error fetching course stats:", error);
            setCoursesWithStats(coursesData);
        }
    };

    // Stats display array
    const statsDisplay = [
        { title: "Your Courses", value: stats.totalCourses, icon: <FaBook />, color: "bg-blue-100 text-blue-500" },
        { title: "Active Exams", value: stats.activeExams, icon: <FaFileAlt />, color: "bg-yellow-100 text-yellow-500" },
        { title: "Total Questions", value: stats.totalQuestions, icon: <FaQuestionCircle />, color: "bg-green-100 text-green-500" },
        { title: "Students", value: stats.totalStudents, icon: <FaUsers />, color: "bg-purple-100 text-purple-500" },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <Sidebar>
                <Link
                    to={`/instructor/dashboard/${id}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaTachometerAlt />
                    <span>Dashboard</span>
                </Link>
                <Link
                    to={`/instructor/${id}`}
                    className="flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg transition-colors duration-200"
                >
                    <FaBook />
                    <span>Courses</span>
                </Link>
            </Sidebar>
            
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {user?.full_name || 'Instructor'}!
                        </h1>
                        <p className="text-gray-600 mt-1">Manage your assigned courses and exams</p>
                    </div>
                    <div className="flex items-center space-x-4">
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
                                    {loading ? (
                                        <span className="text-gray-400">...</span>
                                    ) : (
                                        stat.value
                                    )}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Courses Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Your Assigned Courses</h2>
                        <div className="text-sm text-gray-500">
                            Courses assigned by administrator
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : err ? (
                        <div className="text-center py-8">
                            <i className="fas fa-exclamation-triangle text-yellow-500 text-2xl mb-2"></i>
                            <p className="text-gray-600">Error loading courses: {err}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Retry
                            </button>
                        </div>
                    ) : !courses || courses.length === 0 ? (
                        <div className="text-center py-12">
                            <i className="fas fa-book text-gray-300 text-5xl mb-4"></i>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No Courses Assigned</h3>
                            <p className="text-gray-600 mb-6">Contact your administrator to assign courses to you</p>
                            <p className="text-sm text-gray-500">
                                If courses were recently assigned, try refreshing the page
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {(coursesWithStats.length > 0 ? coursesWithStats : courses).map((course) => (
                                <Link
                                    key={course.course_id}
                                    to={`/exams/${id}/${course.course_id}`}
                                    className="group block"
                                >
                                    <div className="bg-white rounded-xl p-6 hover:bg-gradient-to-br from-blue-50 to-white transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-lg relative">
                                        {/* Active Exam Indicator */}
                                        {course.hasActiveExam && (
                                            <div className="absolute top-4 right-4">
                                                <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                    Active
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                                    <FaBook className="text-white text-xl" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {course.code || 'Course Code'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-sm mb-3">
                                            <span className="text-gray-600 flex items-center gap-1">
                                                <FaQuestionCircle className="text-green-500" />
                                                {course.questionCount || 0} Questions
                                            </span>
                                            <span className="text-gray-600 flex items-center gap-1">
                                                <FaFileAlt className="text-yellow-500" />
                                                {course.examCount || 0} Exams
                                            </span>
                                        </div>
                                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                            <Link
                                                to={`/instructor-student/${id}/${course.course_id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium text-center"
                                            >
                                                <FaUsers className="inline mr-1" />
                                                Students
                                            </Link>
                                            <Link
                                                to={`/course-results/${id}/${course.course_id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium text-center"
                                            >
                                                <FaChartBar className="inline mr-1" />
                                                Results
                                            </Link>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link 
                                to={courses && courses.length > 0 ? `/exams/${id}/${courses[0]?.course_id}` : "#"}
                                className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
                                    courses && courses.length > 0 
                                        ? "bg-blue-50 hover:bg-blue-100" 
                                        : "bg-gray-100 cursor-not-allowed"
                                }`}
                            >
                                <div className={`p-3 rounded-lg ${
                                    courses && courses.length > 0 
                                        ? "bg-blue-500 text-white" 
                                        : "bg-gray-300 text-gray-500"
                                }`}>
                                    <FaFileAlt />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Manage Exams</h4>
                                    <p className="text-sm text-gray-600">Create and manage course exams</p>
                                </div>
                            </Link>
                            
                            <Link 
                                to={courses && courses.length > 0 ? `/question-bank/${id}/${courses[0]?.course_id}` : "#"}
                                className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
                                    courses && courses.length > 0 
                                        ? "bg-green-50 hover:bg-green-100" 
                                        : "bg-gray-100 cursor-not-allowed"
                                }`}
                            >
                                <div className={`p-3 rounded-lg ${
                                    courses && courses.length > 0 
                                        ? "bg-green-500 text-white" 
                                        : "bg-gray-300 text-gray-500"
                                }`}>
                                    <FaQuestionCircle />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Question Bank</h4>
                                    <p className="text-sm text-gray-600">Access and manage questions</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 text-blue-500 rounded-full mt-1">
                                    <FaBook className="text-sm" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Course Access</h4>
                                    <p className="text-sm text-gray-600">Accessed your assigned courses</p>
                                    <p className="text-xs text-gray-500 mt-1">Today</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 text-green-500 rounded-full mt-1">
                                    <FaQuestionCircle className="text-sm" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Questions Viewed</h4>
                                    <p className="text-sm text-gray-600">Reviewed question bank</p>
                                    <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Instructor;