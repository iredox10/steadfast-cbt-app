import React from "react";
import Sidebar from "../../components/Sidebar";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import {
    FaBook,
    FaChalkboardTeacher,
    FaUsers,
    FaQuestionCircle,
    FaFileAlt,
    FaChartBar
} from "react-icons/fa";

const Instructor = () => {
    const { id } = useParams();
    const { data: courses, loading, err } = useFetch(`/get-lecturer-courses/${id}`);
    const {
        data: user,
        loading: userLoading,
        err: userErr,
    } = useFetch(`/get-user/${id}`);

    // Stats based on what instructors can actually access
    const stats = [
        { title: "Your Courses", value: courses ? courses.length : 0, icon: <FaBook />, color: "bg-blue-100 text-blue-500" },
        { title: "Active Exams", value: "0", icon: <FaFileAlt />, color: "bg-yellow-100 text-yellow-500" },
        { title: "Total Questions", value: "0", icon: <FaQuestionCircle />, color: "bg-green-100 text-green-500" },
        { title: "Students", value: "0", icon: <FaUsers />, color: "bg-purple-100 text-purple-500" },
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

                {/* Courses Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Your Assigned Courses</h2>
                        <div className="text-sm text-gray-500">
                            Courses assigned by administrator
                        </div>
                    </div>

                    {userLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : err ? (
                        <div className="text-center py-8">
                            <i className="fas fa-exclamation-triangle text-yellow-500 text-2xl mb-2"></i>
                            <p className="text-gray-600">Error loading courses</p>
                        </div>
                    ) : !courses || courses.length === 0 ? (
                        <div className="text-center py-12">
                            <i className="fas fa-book text-gray-300 text-5xl mb-4"></i>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No Courses Assigned</h3>
                            <p className="text-gray-600 mb-6">Contact your administrator to assign courses to you</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {courses && courses.map((course) => (
                                <Link
                                    key={course.course_id}
                                    to={`/exams/${id}/${course.course_id}`}
                                    className="group block"
                                >
                                    <div className="bg-white rounded-xl p-6 hover:bg-gradient-to-br from-blue-50 to-white transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-lg">
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
                                            <div className="bg-gray-50 group-hover:bg-blue-100 p-2 rounded-full transition-colors duration-200">
                                                <i className="fas fa-chevron-right text-gray-400 group-hover:text-blue-600"></i>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>0 Questions</span>
                                            <span>0 Exams</span>
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