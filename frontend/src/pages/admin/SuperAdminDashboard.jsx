import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { 
    FaEye, FaPlus, FaPlay, FaStop, FaChartLine, FaUserCheck, FaFileSignature, 
    FaUserPlus, FaClipboardList, FaRegClock, FaBell, FaCrown, FaUserShield, FaListAlt,
    FaUsers, FaChalkboardTeacher, FaBook, FaBuilding, FaTicketAlt, FaCalendarAlt,
    FaGraduationCap, FaSun, FaMoon, FaCloudSun
} from 'react-icons/fa';
import { path } from '../../../utils/path';
import AdminSidebar from '../../components/AdminSidebar';
import { format } from 'date-fns';
import logo from "../../../public/assets/buk.png";

const SuperAdminDashboard = () => {
    const { userId } = useParams();
    const [currentUser, setCurrentUser] = useState(null);
    const [stats, setStats] = useState({
        totalFaculties: 0,
        totalStudents: 0,
        totalInstructors: 0,
        totalExams: 0,
        totalLevels: 0,
        totalDepartments: 0,
        activeExams: 0,
        recentActivities: []
    });
    const [loading, setLoading] = useState(true);
    const [activeExams, setActiveExams] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    
    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    // Helper function to get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: "Good Morning", icon: <FaSun className="text-yellow-500" /> };
        if (hour < 17) return { text: "Good Afternoon", icon: <FaCloudSun className="text-orange-500" /> };
        return { text: "Good Evening", icon: <FaMoon className="text-indigo-500" /> };
    };

    useEffect(() => {
        fetchCurrentUser();
        fetchStats();
        fetchActiveExams();
        fetchRecentActivities();
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${path}/notifications`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markNotificationAsRead = async (id, actionUrl) => {
        try {
            await axios.post(`${path}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchNotifications();
            if (actionUrl) {
                window.location.href = actionUrl;
            }
        } catch (error) {
            console.error('Error marking notification read:', error);
        }
    };

    const markAllNotificationsAsRead = async () => {
        try {
            await axios.post(`${path}/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchNotifications();
            setShowNotifications(false);
        } catch (error) {
            console.error('Error marking all notifications read:', error);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get(`${path}/user`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCurrentUser(response.data);
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            console.log('Fetching stats with token:', token ? 'Token exists' : 'No token');

            // Fetch overall statistics with individual error handling
            try {
                const [studentsRes, usersRes, examsRes, sessionsRes, departmentsRes, facultiesRes] = await Promise.all([
                    axios.get(`${path}/students-by-level`, { headers }),
                    axios.get(`${path}/users-by-level`, { headers }),
                    axios.get(`${path}/exams-by-level`, { headers }),
                    axios.get(`${path}/get-acd-sessions`, { headers }),
                    axios.get(`${path}/departments`, { headers }),
                    axios.get(`${path}/faculties`, { headers })
                ]);

                // Ensure we have arrays before calling .length or .filter
                const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
                const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
                const examsData = Array.isArray(examsRes.data) ? examsRes.data : [];
                const sessionsData = Array.isArray(sessionsRes.data) ? sessionsRes.data : [];
                const departmentsData = Array.isArray(departmentsRes.data) ? departmentsRes.data : [];
                const facultiesData = Array.isArray(facultiesRes.data) ? facultiesRes.data : [];

                setStats({
                    totalFaculties: facultiesData.length,
                    totalStudents: studentsData.length,
                    totalInstructors: usersData.filter(u => u.role === 'lecturer').length,
                    totalExams: examsData.length,
                    totalLevels: sessionsData.length,
                    totalDepartments: departmentsData.length,
                    activeExams: examsData.filter(e => e.status === 'active' || e.activated === 'yes').length,
                    recentActivities: []
                });
            } catch (apiError) {
                console.error('API Error details:', apiError);
                console.error('API Error response:', apiError.response?.data);

                // Set default stats if API calls fail
                setStats({
                    totalStudents: 0,
                    totalInstructors: 0,
                    totalExams: 0,
                    totalLevels: 0,
                    totalDepartments: 0,
                    activeExams: 0,
                    recentActivities: []
                });
            }

        } catch (error) {
            console.error('Error fetching stats:', error);
            // Set default stats on error
            setStats({
                totalStudents: 0,
                totalInstructors: 0,
                totalExams: 0,
                totalLevels: 0,
                totalDepartments: 0,
                activeExams: 0,
                recentActivities: []
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveExams = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${path}/get-exams`, { headers });
            const active = Array.isArray(response.data) 
                ? response.data.filter(exam => exam.activated === 'yes')
                : [];
            setActiveExams(active);
        } catch (error) {
            console.error('Error fetching active exams:', error);
            setActiveExams([]);
        }
    };

    const fetchRecentActivities = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${path}/recent-activities`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const formattedActivities = response.data.map(activity => {
                let icon = <FaClipboardList className="text-gray-500" />;
                
                // Map the backend 'type' string to the proper React icon
                switch(activity.type) {
                    case 'check-in': icon = <FaUserCheck className="text-green-500" />; break;
                    case 'submission': icon = <FaFileSignature className="text-blue-500" />; break;
                    case 'exam-start': icon = <FaPlay className="text-purple-500" />; break;
                    case 'ticket': icon = <FaTicketAlt className="text-orange-500" />; break;
                    case 'admin': icon = <FaUserShield className="text-red-500" />; break;
                    case 'time-extension': icon = <FaRegClock className="text-yellow-500" />; break;
                }

                return {
                    id: activity.id,
                    type: activity.type,
                    message: activity.message,
                    time: activity.time, // from diffForHumans
                    icon: icon
                };
            });
            
            setRecentActivities(formattedActivities);
        } catch (error) {
            console.error('Error fetching activities:', error);
            setRecentActivities([]);
        } finally {
            setActivitiesLoading(false);
        }
    };

    const StatCard = ({ icon, title, value, color = "blue", trend, trendUp, onClick }) => (
        <div
            className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center">
                <div className={`p-4 bg-${color}-100 rounded-full text-${color}-600 mr-4`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar userId={userId} />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                            {currentUser?.role === 'super_admin' && <FaCrown className="mr-3 text-yellow-500" />}
                            {currentUser?.role === 'faculty_officer' && <FaBuilding className="mr-3 text-blue-500" />}
                            {currentUser?.role === 'level_admin' && <FaUserShield className="mr-3 text-blue-500" />}
                            
                            {currentUser?.role === 'super_admin' ? 'Super Admin Dashboard' : 
                             currentUser?.role === 'faculty_officer' ? 'Faculty Officer Dashboard' : 
                             'Department Officer Dashboard'}
                        </h2>
                        <p className="text-gray-500 mt-2">Welcome back, {currentUser?.full_name}</p>
                        {currentUser?.role === 'faculty_officer' && currentUser?.faculty && (
                            <p className="text-blue-600 text-sm font-bold">Faculty: {currentUser.faculty.name}</p>
                        )}
                        {currentUser?.role === 'level_admin' && currentUser?.level?.title && (
                            <p className="text-blue-600 text-sm">Managing: {currentUser.level.title}</p>
                        )}
                    </div>
                    <div className="flex items-center space-x-4 relative">
                        <button 
                            className="p-3 bg-white border rounded-full hover:bg-gray-100 relative focus:outline-none"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <FaBell className="text-gray-600" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute top-12 right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={markAllNotificationsAsRead}
                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    {notifications.length > 0 ? (
                                        notifications.map(notification => (
                                            <div 
                                                key={notification.id} 
                                                onClick={() => markNotificationAsRead(notification.id, notification.data.action_url)}
                                                className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read_at ? 'bg-blue-50/30' : ''}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`mt-1 p-2 rounded-full ${!notification.read_at ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                        <FaBell size={12} />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm ${!notification.read_at ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                            {notification.data.message}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {format(new Date(notification.created_at), "MMM d, h:mm a")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-gray-500 text-sm">
                                            No notifications yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-8">
                    {/* Enhanced Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        {currentUser?.role === 'super_admin' && (
                            <StatCard
                                icon={<FaBuilding />}
                                title="Total Faculties"
                                value={stats?.totalFaculties || 0}
                                color="indigo"
                                onClick={() => window.location.href = '/faculty-management'}
                            />
                        )}
                        {(currentUser?.role === 'super_admin' || currentUser?.role === 'faculty_officer') && (
                            <StatCard
                                icon={<FaBuilding />}
                                title="Departments"
                                value={stats?.totalDepartments || 0}
                                color="orange"
                                onClick={() => window.location.href = '/department-management'}
                            />
                        )}
                        <StatCard
                            icon={<FaUsers />}
                            title="Total Students"
                            value={stats?.totalStudents || 0}
                            color="blue"
                            trend="+15%"
                            trendUp={true}
                            onClick={() => window.location.href = `/admin-students/${userId}`}
                        />
                        <StatCard
                            icon={<FaChalkboardTeacher />}
                            title="Total Instructors"
                            value={stats?.totalInstructors || 0}
                            color="green"
                            trend="+5"
                            trendUp={true}
                            onClick={() => window.location.href = `/admin-instructors/${userId}`}
                        />
                        <StatCard
                            icon={<FaBook />}
                            title="Total Exams"
                            value={stats?.totalExams || 0}
                            color="purple"
                            trend={`${activeExams.length} Active`}
                            trendUp={activeExams.length > 0}
                            onClick={() => window.location.href = `/admin-exam/${userId}`}
                        />
                    </div>

                    {/* Analytics and Activity Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        
                        {/* Visual Analytics (CSS based) */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <FaChartLine className="text-indigo-500" />
                                System Overview Analytics
                            </h3>
                            
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* User Distribution */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-4">User Distribution</h4>
                                    <div className="flex items-end h-32 gap-2 mb-2">
                                        <div className="flex-1 h-full flex flex-col justify-end group relative">
                                            <div className="w-full bg-blue-500 rounded-t-md transition-all duration-500" style={{ height: `${Math.max(10, Math.min(100, (stats?.totalStudents / (stats?.totalStudents + stats?.totalInstructors + 1)) * 100))}%` }}></div>
                                            <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap transition-opacity">
                                                {stats?.totalStudents} Students
                                            </div>
                                        </div>
                                        <div className="flex-1 h-full flex flex-col justify-end group relative">
                                            <div className="w-full bg-green-500 rounded-t-md transition-all duration-500" style={{ height: `${Math.max(10, Math.min(100, (stats?.totalInstructors / (stats?.totalStudents + stats?.totalInstructors + 1)) * 100))}%` }}></div>
                                            <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap transition-opacity">
                                                {stats?.totalInstructors} Instructors
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 border-t pt-2">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Students</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Instructors</span>
                                    </div>
                                </div>

                                {/* Exam Status */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-4">Exam Status Summary</h4>
                                    <div className="space-y-4 mt-2">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700">Active Exams</span>
                                                <span className="text-gray-500">{activeExams.length} / {stats?.totalExams || 0}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, (activeExams.length / (stats?.totalExams || 1)) * 100))}%` }}></div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700">Faculty Coverage</span>
                                                <span className="text-gray-500">{stats?.totalFaculties || 0} Faculties</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700">Department Coverage</span>
                                                <span className="text-gray-500">{stats?.totalDepartments || 0} Depts</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Feed */}
                        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full max-h-96">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaClipboardList className="text-blue-500" />
                                Recent Activity
                            </h3>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                {activitiesLoading ? (
                                    <div className="animate-pulse space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex gap-3">
                                                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : recentActivities.length > 0 ? (
                                    recentActivities.map((activity, index) => (
                                        <div key={activity.id} className="flex items-start gap-3 relative pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                            <div className="mt-1 p-2 bg-gray-50 rounded-full shadow-sm">
                                                {activity.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <FaRegClock /> {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No recent activities.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Active Exams Section - Full Width */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="border-b border-gray-100 p-4">
                            <h3 className="text-gray-900 text-lg font-semibold flex items-center gap-2">
                                <FaPlay className="text-green-500" />
                                Currently Active Exams ({activeExams.length})
                            </h3>
                        </div>
                        <div className="p-6">
                            {activeExams.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {activeExams.map(exam => (
                                        <div key={exam.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-gray-900 flex-1">{exam.title || exam.exam_type}</h4>
                                                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                                        LIVE
                                                    </span>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <FaRegClock className="text-gray-400" />
                                                        <span>{exam.exam_duration} minutes</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <FaUserCheck className="text-gray-400" />
                                                        <span>{exam.invigilator || 'No invigilator'}</span>
                                                    </div>
                                                </div>
                                                <Link 
                                                    to={`/admin-exam/${userId}`}
                                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                                >
                                                    <FaEye /> Monitor
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FaStop className="mx-auto text-5xl text-gray-300 mb-3" />
                                    <p className="text-gray-600 font-medium">No Active Exams</p>
                                    <Link 
                                        to={`/admin-exam/${userId}`}
                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                                    >
                                        <FaPlay /> Activate an Exam
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SuperAdminDashboard;