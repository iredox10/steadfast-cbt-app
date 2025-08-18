import React from "react";
import { Link, useParams } from "react-router-dom";
import { FaBook, FaQuestionCircle, FaUsers, FaFileAlt, FaChartBar } from "react-icons/fa";
import useFetch from "../../hooks/useFetch";
import Sidebar from "../../components/Sidebar";

const Dashboard = () => {
    const { id } = useParams();
    
    const { data: user, loading: userLoading } = useFetch(`/get-user/${id}`);
    const { data: courses } = useFetch(`/get-lecturer-courses/${id}`);

    // Mock stats data
    const stats = [
        { title: "Total Courses", value: courses?.length || 0, icon: <FaBook />, color: "bg-blue-100 text-blue-500" },
        { title: "Total Questions", value: "124", icon: <FaQuestionCircle />, color: "bg-green-100 text-green-500" },
        { title: "Active Exams", value: "8", icon: <FaFileAlt />, color: "bg-yellow-100 text-yellow-500" },
        { title: "Total Students", value: "245", icon: <FaUsers />, color: "bg-purple-100 text-purple-500" },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <Sidebar>
                <Link
                    to="#"
                    className="flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg transition-colors duration-200"
                >
                    <FaBook />
                    <span>Courses</span>
                </Link>
                <Link
                    to="#"
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaQuestionCircle />
                    <span>Questions</span>
                </Link>
                <Link
                    to="#"
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaUsers />
                    <span>Students</span>
                </Link>
                <Link
                    to="#"
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaFileAlt />
                    <span>Exams</span>
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
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                            <div className={`p-4 rounded-full ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link to="#" className="p-5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 border border-blue-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-blue-500 text-white rounded-lg">
                                        <FaBook />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">Add New Course</h3>
                                </div>
                                <p className="text-sm text-gray-600">Create a new course and set up exams</p>
                            </Link>
                            
                            <Link to="#" className="p-5 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 border border-green-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-green-500 text-white rounded-lg">
                                        <FaQuestionCircle />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">Create Question</h3>
                                </div>
                                <p className="text-sm text-gray-600">Add a new question to your bank</p>
                            </Link>
                            
                            <Link to="#" className="p-5 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors duration-200 border border-yellow-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-yellow-500 text-white rounded-lg">
                                        <FaFileAlt />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">Create Exam</h3>
                                </div>
                                <p className="text-sm text-gray-600">Set up a new examination</p>
                            </Link>
                            
                            <Link to="#" className="p-5 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 border border-purple-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-purple-500 text-white rounded-lg">
                                        <FaChartBar />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">View Reports</h3>
                                </div>
                                <p className="text-sm text-gray-600">Check exam results and analytics</p>
                            </Link>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 text-blue-500 rounded-full mt-1">
                                    <FaBook className="text-sm" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">New Course Added</h3>
                                    <p className="text-sm text-gray-600">Computer Science 101</p>
                                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 text-green-500 rounded-full mt-1">
                                    <FaQuestionCircle className="text-sm" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">15 Questions Added</h3>
                                    <p className="text-sm text-gray-600">Database Systems</p>
                                    <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-yellow-100 text-yellow-500 rounded-full mt-1">
                                    <FaFileAlt className="text-sm" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Exam Scheduled</h3>
                                    <p className="text-sm text-gray-600">Midterm Exam - Mathematics</p>
                                    <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
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
                            <div key={course.course_id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
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
                                    <span>12 Questions</span>
                                    <span>Active</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;