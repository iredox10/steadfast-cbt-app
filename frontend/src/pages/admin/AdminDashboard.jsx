import React, { useEffect, useState } from "react";
import {
    FaUsers,
    FaBook,
    FaBell,
    FaClock,
    FaFileSignature,
    FaChalkboardTeacher,
    FaListAlt,
} from "react-icons/fa";
import { Link, useParams, Navigate } from "react-router-dom";
import axios from "axios";
import { path } from "../../../utils/path";
import { format } from 'date-fns';
import AdminSidebar from "../../components/AdminSidebar";

const AdminDashboard = () => {
    const { userId } = useParams();
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [statsData, setStatsData] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [examsLoading, setExamsLoading] = useState(true);
    const [recentSubmissions, setRecentSubmissions] = useState([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(true);

    useEffect(() => {
        fetchCurrentUser();
        fetchDashboardData();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get(`${path}/user`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCurrentUser(response.data);
        } catch (error) {
            console.error('Error fetching current user:', error);
        } finally {
            setUserLoading(false);
        }
    };

    const fetchDashboardData = async () => {
        // Fetch dashboard stats
        try {
            const response = await axios.get(`${path}/dashboard-stats`);
            setStatsData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setStatsData(null);
        } finally {
            setStatsLoading(false);
        }

        // Fetch upcoming exams
        try {
            const response = await axios.get(`${path}/upcoming-exams`);
            setUpcomingExams(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching upcoming exams:', error);
            setUpcomingExams([]);
        } finally {
            setExamsLoading(false);
        }

        // Fetch recent submissions
        try {
            const response = await axios.get(`${path}/recent-submissions`);
            setRecentSubmissions(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching recent submissions:', error);
            setRecentSubmissions([]);
        } finally {
            setSubmissionsLoading(false);
        }
    };

    // Redirect to new hierarchical dashboard for super_admin, level_admin and faculty_officer
    if (!userLoading && currentUser && ['super_admin', 'level_admin', 'faculty_officer'].includes(currentUser.role)) {
        return <Navigate to={`/admin-dashboard/${userId}`} replace />;
    }

    const stats = [
        { title: "Total Students", value: statsLoading ? "..." : statsData?.total_students || "0", icon: <FaUsers /> },
        { title: "Active Courses", value: statsLoading ? "..." : statsData?.active_courses || "0", icon: <FaBook /> },
        { title: "Total Instructors", value: statsLoading ? "..." : statsData?.total_instructors || "0", icon: <FaChalkboardTeacher /> },
        { title: "Question Banks", value: "12", icon: <FaListAlt /> }, // Mocked data
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <AdminSidebar userId={userId} />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Welcome back, {currentUser?.full_name || 'Admin'}!
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
                            {examsLoading ? (
                                <p>Loading...</p>
                            ) : upcomingExams.length > 0 ? (
                                upcomingExams.map(exam => (
                                    <div key={exam.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-800">{exam.title}</h4>
                                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                                <FaClock className="mr-2" /> {format(new Date(exam.created_at), 'PPP')}
                                            </p>
                                        </div>
                                        <Link to="#" className="text-blue-500 hover:underline">View</Link>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No upcoming exams</p>
                            )}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
                        <ul className="space-y-3">
                            {submissionsLoading ? (
                                <p>Loading...</p>
                            ) : recentSubmissions.length > 0 ? (
                                recentSubmissions.map(sub => (
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
                                ))
                            ) : (
                                <p className="text-gray-500">No recent submissions</p>
                            )}
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
