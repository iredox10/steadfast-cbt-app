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
import LevelSelector from '../../components/LevelSelector';
import logo from "../../../public/assets/buk.png";

const SuperAdminDashboard = () => {
    const { userId } = useParams();
    const [currentUser, setCurrentUser] = useState(null);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalInstructors: 0,
        totalExams: 0,
        totalLevels: 0,
        totalDepartments: 0,
        activeExams: 0,
        recentActivities: []
    });
    const [selectedLevel, setSelectedLevel] = useState('');
    const [levelStats, setLevelStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeExams, setActiveExams] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);

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
    }, []);

    useEffect(() => {
        if (selectedLevel && currentUser?.role === 'super_admin') {
            fetchLevelStats();
        }
    }, [selectedLevel]);

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
                const studentsRes = await axios.get(`${path}/students-by-level`, { headers });
                console.log('Students response:', studentsRes.data);

                const usersRes = await axios.get(`${path}/users-by-level`, { headers });
                console.log('Users response:', usersRes.data);

                const examsRes = await axios.get(`${path}/exams-by-level`, { headers });
                console.log('Exams response:', examsRes.data);

                const sessionsRes = await axios.get(`${path}/get-acd-sessions`);
                console.log('Sessions response:', sessionsRes.data);

                // Fetch departments
                const departmentsRes = await axios.get(`${path}/departments`, { headers });
                console.log('Departments response:', departmentsRes.data);

                // Ensure we have arrays before calling .length or .filter
                const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
                const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
                const examsData = Array.isArray(examsRes.data) ? examsRes.data : [];
                const sessionsData = Array.isArray(sessionsRes.data) ? sessionsRes.data : [];
                const departmentsData = Array.isArray(departmentsRes.data) ? departmentsRes.data : [];

                setStats({
                    totalStudents: studentsData.length,
                    totalInstructors: usersData.filter(u => u.role === 'lecturer').length,
                    totalExams: examsData.length,
                    totalLevels: sessionsData.length,
                    totalDepartments: departmentsData.length,
                    activeExams: examsData.filter(e => e.status === 'active').length,
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

    const fetchLevelStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [studentsRes, usersRes, examsRes] = await Promise.all([
                axios.get(`${path}/students-by-level?level_id=${selectedLevel}`, { headers }),
                axios.get(`${path}/users-by-level?level_id=${selectedLevel}`, { headers }),
                axios.get(`${path}/exams-by-level?level_id=${selectedLevel}`, { headers })
            ]);

            // Ensure we have arrays before calling .length or .filter
            const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
            const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
            const examsData = Array.isArray(examsRes.data) ? examsRes.data : [];

            setLevelStats({
                students: studentsData.length,
                instructors: usersData.filter(u => u.role === 'lecturer').length,
                exams: examsData.length,
                activeExams: examsData.filter(e => e.status === 'active').length
            });

        } catch (error) {
            console.error('Error fetching level stats:', error);
            setLevelStats({
                students: 0,
                instructors: 0,
                exams: 0,
                activeExams: 0
            });
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
            // Mock activities - replace with actual API when available
            const mockActivities = [
                { id: 1, type: 'check-in', message: 'Student checked in for Mathematics exam', time: '2 minutes ago', icon: <FaUserCheck className="text-green-500" /> },
                { id: 2, type: 'submission', message: 'New exam submission received', time: '5 minutes ago', icon: <FaFileSignature className="text-blue-500" /> },
                { id: 3, type: 'exam-start', message: 'Chemistry exam activated', time: '12 minutes ago', icon: <FaPlay className="text-purple-500" /> },
                { id: 4, type: 'ticket', message: 'Exam tickets generated for 60 students', time: '18 minutes ago', icon: <FaTicketAlt className="text-orange-500" /> },
                { id: 5, type: 'admin', message: 'New level admin created for Level 200', time: '25 minutes ago', icon: <FaUserShield className="text-red-500" /> },
            ];
            setRecentActivities(mockActivities);
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
                            {currentUser?.role === 'level_admin' && <FaUserShield className="mr-3 text-blue-500" />}
                            {currentUser?.role === 'super_admin' ? 'Super Admin Dashboard' : 'Level Admin Dashboard'}
                        </h2>
                        <p className="text-gray-500 mt-2">Welcome back, {currentUser?.full_name}</p>
                        {currentUser?.role === 'level_admin' && currentUser?.level?.title && (
                            <p className="text-blue-600 text-sm">Managing: {currentUser.level.title}</p>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-3 bg-white border rounded-full hover:bg-gray-100 relative">
                            <FaBell className="text-gray-600" />
                            {activeExams.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                    {activeExams.length}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-8">
                    {/* Level Selector for Super Admin */}
                    {currentUser?.role === 'super_admin' && (
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
                                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                                <FaListAlt className="text-blue-500" />
                                                                Filter by Session
                                                            </h3>
                                                            <LevelSelector
                                                                currentUser={currentUser}
                                                                selectedLevel={selectedLevel}
                                                                onLevelChange={setSelectedLevel}
                                                                showAllOption={true}
                                                                allOptionText="All Sessions"
                                                            />                        </div>
                    )}

                    {/* Enhanced Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                        {currentUser?.role === 'super_admin' && (
                            <>
                                <StatCard
                                    icon={<FaBuilding />}
                                    title="Departments"
                                    value={stats?.totalDepartments || 0}
                                    color="orange"
                                    onClick={() => window.location.href = '/department-management'}
                                />
                                <StatCard
                                    icon={<FaGraduationCap />}
                                    title="Academic Levels"
                                    value={stats?.totalLevels || 0}
                                    color="yellow"
                                    onClick={() => window.location.href = '/admin-sessions'}
                                />
                            </>
                        )}
                        {currentUser?.role === 'level_admin' && (
                            <>
                                <StatCard
                                    icon={<FaPlay />}
                                    title="Active Exams"
                                    value={activeExams.length || 0}
                                    color="red"
                                    trend="Live"
                                    trendUp={true}
                                />
                                <StatCard
                                    icon={<FaTicketAlt />}
                                    title="Exam Tickets"
                                    value={stats?.activeExams > 0 ? stats.activeExams : 0}
                                    color="indigo"
                                    onClick={() => window.location.href = `/admin-tickets/${userId}`}
                                />
                            </>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Link 
                                to={`/admin-students/${userId}`}
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FaUserPlus className="mr-3 text-blue-500" />
                                <div>
                                    <div className="font-medium">Add Student</div>
                                    <div className="text-sm text-gray-600">Register a new student</div>
                                </div>
                            </Link>

                            <Link 
                                to={`/admin-exam/${userId}`}
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FaBook className="mr-3 text-purple-500" />
                                <div>
                                    <div className="font-medium">Manage Exams</div>
                                    <div className="text-sm text-gray-600">Activate and monitor exams</div>
                                </div>
                            </Link>

                            <Link 
                                to={`/admin-tickets/${userId}`}
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FaTicketAlt className="mr-3 text-orange-500" />
                                <div>
                                    <div className="font-medium">View Tickets</div>
                                    <div className="text-sm text-gray-600">View and manage exam tickets</div>
                                </div>
                            </Link>

                            <Link 
                                to="/exam-archives"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FaEye className="mr-3 text-gray-500" />
                                <div>
                                    <div className="font-medium">Exam Archives</div>
                                    <div className="text-sm text-gray-600">View past exam results</div>
                                </div>
                            </Link>

                            {currentUser?.role === 'super_admin' && (
                                <>
                                    <Link 
                                        to="/department-management"
                                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <FaBuilding className="mr-3 text-orange-500" />
                                        <div>
                                            <div className="font-medium">Manage Departments</div>
                                            <div className="text-sm text-gray-600">Create and manage departments</div>
                                        </div>
                                    </Link>

                                    <Link 
                                        to="/admin-management"
                                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <FaUserShield className="mr-3 text-red-500" />
                                        <div>
                                            <div className="font-medium">Admin Management</div>
                                            <div className="text-sm text-gray-600">Create and manage administrators</div>
                                        </div>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Level-specific Statistics (for Super Admin) */}
                    {currentUser?.role === 'super_admin' && selectedLevel && levelStats && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Level Statistics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{levelStats?.students || 0}</div>
                                    <div className="text-sm text-gray-600">Students</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{levelStats?.instructors || 0}</div>
                                    <div className="text-sm text-gray-600">Instructors</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{levelStats?.exams || 0}</div>
                                    <div className="text-sm text-gray-600">Exams</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{levelStats?.activeExams || 0}</div>
                                    <div className="text-sm text-gray-600">Active Exams</div>
                                </div>
                            </div>
                        </div>
                    )}

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