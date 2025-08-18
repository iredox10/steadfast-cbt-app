import React from "react";
import {
    FaUsers,
    FaBook,
    FaChalkboardTeacher,
    FaCalendarAlt,
    FaCog,
    FaSignOutAlt,
    FaBell,
    FaListAlt,
    FaClock,
    FaFileSignature
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { format } from 'date-fns';
import logo from "../../../public/assets/buk.png"; // Import the logo

const AdminDashboard = () => {
    const { userId } = useParams();
    const { data: user, loading: userLoading } = useFetch(`/get-user/${userId}`);
    const { data: statsData, loading: statsLoading } = useFetch('/dashboard-stats');
    const { data: upcomingExams, loading: examsLoading } = useFetch('/upcoming-exams');
    const { data: recentSubmissions, loading: submissionsLoading } = useFetch('/recent-submissions');

    const stats = [
        { title: "Total Students", value: statsLoading ? "..." : statsData?.total_students || "0", icon: <FaUsers /> },
        { title: "Active Courses", value: statsLoading ? "..." : statsData?.active_courses || "0", icon: <FaBook /> },
        { title: "Total Instructors", value: statsLoading ? "..." : statsData?.total_instructors || "0", icon: <FaChalkboardTeacher /> },
        { title: "Question Banks", value: "12", icon: <FaListAlt /> }, // Mocked data
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-6 flex-shrink-0 border-r border-gray-200">
                <div className="flex items-center mb-10">
                    <img src={logo} alt="School Logo" className="h-10 w-10 mr-3" />
                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                </div>
                <nav className="space-y-2">
                    <Link to={`/dashboard/${userId}`} className="flex items-center p-3 bg-blue-500 text-white rounded-lg">
                        <FaListAlt className="mr-3" /> Dashboard
                    </Link>
                    <Link to="/admin-sessions" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaCalendarAlt className="mr-3" /> Sessions
                    </Link>
                    <Link to={`/admin-students/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaUsers className="mr-3" /> Students
                    </Link>
                    <Link to="/admin-instructors" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaChalkboardTeacher className="mr-3" /> Instructors
                    </Link>
                    <Link to="/exam-archives" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaBook className="mr-3" /> Exam Archives
                    </Link>
                    <Link to={`/admin-exam/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaBook className="mr-3" /> Exams
                    </Link>
                </nav>
                <div className="absolute bottom-6 left-6 right-6 w-52">
                    <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaCog className="mr-3" /> Settings
                    </Link>
                    <Link to="/admin-login" className="flex items-center p-3 mt-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <FaSignOutAlt className="mr-3" /> Logout
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Welcome back, {user?.name || 'Admin'}!
                        </h2>
                        <p className="text-gray-500">Here's what's happening with your exams today.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-3 bg-white border rounded-full hover:bg-gray-100">
                            <FaBell className="text-gray-600" />
                        </button>
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

                {/* CBT Specific Components */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Exams</h3>
                        <div className="space-y-4">
                            {examsLoading ? <p>Loading...</p> : (upcomingExams || []).map(exam => (
                                <div key={exam.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-800">{exam.title}</h4>
                                        <p className="text-sm text-gray-500 flex items-center mt-1">
                                            <FaClock className="mr-2" /> {format(new Date(exam.created_at), 'PPP')}
                                        </p>
                                    </div>
                                    <Link to="#" className="text-blue-500 hover:underline">View</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
                        <ul className="space-y-3">
                            {submissionsLoading ? <p>Loading...</p> : (recentSubmissions || []).map(sub => (
                                <li key={sub.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        <FaFileSignature className="mr-3 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-700">{sub.student?.full_name}</p>
                                            <p className="text-gray-500">{sub.exam?.title}</p>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-green-600">{sub.score}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
