import React, { useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import {
    FaBook,
    FaChalkboardTeacher,
    FaUsers,
    FaQuestionCircle,
    FaPlus,
    FaChevronRight
} from "react-icons/fa";

const Instructor = () => {
    const { id } = useParams();
    const { data: courses, loading, err } = useFetch(`/get-lecturer-courses/${id}`);
    const {
        data: user,
        loading: userLoading,
        err: userErr,
    } = useFetch(`/get-user/${id}`);

    // Mock stats data
    const stats = [
        { title: "Total Courses", value: courses ? courses.length : 0, icon: <FaBook /> },
        { title: "Total Questions", value: "124", icon: <FaQuestionCircle /> },
        { title: "Active Exams", value: "8", icon: <FaChalkboardTeacher /> },
        { title: "Students", value: "245", icon: <FaUsers /> },
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
                    <FaChalkboardTeacher />
                    <span>Exams</span>
                </Link>
            </Sidebar>
            
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {user?.full_name || 'Instructor'}!
                        </h1>
                        <p className="text-gray-600 mt-1">Manage your courses and exams</p>
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
                            <div className="p-4 bg-blue-100 rounded-full text-blue-500">
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
                        <h2 className="text-xl font-bold text-gray-900">Your Courses</h2>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            <FaPlus />
                            <span>Add Course</span>
                        </button>
                    </div>

                    {userLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                                                <FaChevronRight className="text-gray-400 group-hover:text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>12 Questions</span>
                                            <span>Active</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Questions Added</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-800">What is the time complexity of binary search?</h4>
                                <p className="text-sm text-gray-500 mt-1">Computer Science 101</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-800">Explain the concept of polymorphism</h4>
                                <p className="text-sm text-gray-500 mt-1">Object Oriented Programming</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-800">Database normalization techniques</h4>
                                <p className="text-sm text-gray-500 mt-1">Database Systems</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Exams</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-800">Midterm Exam</h4>
                                    <p className="text-sm text-gray-500">Computer Science 101</p>
                                </div>
                                <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">In 3 days</span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-800">Final Exam</h4>
                                    <p className="text-sm text-gray-500">Database Systems</p>
                                </div>
                                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">In 2 weeks</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Instructor;