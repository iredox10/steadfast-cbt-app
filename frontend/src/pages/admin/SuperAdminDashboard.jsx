import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { FaUsers, FaBook, FaChalkboardTeacher, FaCalendarAlt, FaUserShield, FaCrown, FaEye, FaPlus, FaGraduationCap } from 'react-icons/fa';
import { path } from '../../../utils/path';
import LevelSelector from '../../components/LevelSelector';

const SuperAdminDashboard = () => {
    const { userId } = useParams();
    const [currentUser, setCurrentUser] = useState(null);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalInstructors: 0,
        totalExams: 0,
        totalLevels: 0,
        activeExams: 0,
        recentActivities: []
    });
    const [selectedLevel, setSelectedLevel] = useState('');
    const [levelStats, setLevelStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCurrentUser();
        fetchStats();
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

                // Ensure we have arrays before calling .length or .filter
                const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
                const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
                const examsData = Array.isArray(examsRes.data) ? examsRes.data : [];
                const sessionsData = Array.isArray(sessionsRes.data) ? sessionsRes.data : [];

                setStats({
                    totalStudents: studentsData.length,
                    totalInstructors: usersData.filter(u => u.role === 'lecturer').length,
                    totalExams: examsData.length,
                    totalLevels: sessionsData.length,
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

    const StatCard = ({ icon, title, value, color = "blue", onClick }) => (
        <div 
            className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center">
                <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600 mr-4`}>
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
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        {currentUser?.role === 'super_admin' && <FaCrown className="mr-3 text-yellow-500" />}
                        {currentUser?.role === 'level_admin' && <FaUserShield className="mr-3 text-blue-500" />}
                        {currentUser?.role === 'super_admin' ? 'Super Admin Dashboard' : 'Level Admin Dashboard'}
                    </h1>
                    <p className="text-gray-600 mt-2">Welcome back, {currentUser?.full_name}</p>
                    {currentUser?.role === 'level_admin' && currentUser?.level?.title && (
                        <p className="text-blue-600 text-sm">Managing: {currentUser.level.title}</p>
                    )}
                </div>
                <div className="flex gap-4">
                    <Link
                        to="/admin-management"
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        <FaUserShield className="mr-2" />
                        Manage Admins
                    </Link>
                    <Link
                        to={`/admin-students/${userId}`}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                        <FaUsers className="mr-2" />
                        View Students
                    </Link>
                </div>
            </div>

            {/* Level Selector for Super Admin */}
            {currentUser?.role === 'super_admin' && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                    <LevelSelector
                        currentUser={currentUser}
                        selectedLevel={selectedLevel}
                        onLevelChange={setSelectedLevel}
                        showAllOption={true}
                    />
                </div>
            )}

            {/* Overall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<FaUsers />}
                    title="Total Students"
                    value={stats?.totalStudents || 0}
                    color="blue"
                    onClick={() => window.location.href = `/admin-students/${userId}`}
                />
                <StatCard
                    icon={<FaChalkboardTeacher />}
                    title="Total Instructors"
                    value={stats?.totalInstructors || 0}
                    color="green"
                    onClick={() => window.location.href = '/admin-instructors'}
                />
                <StatCard
                    icon={<FaBook />}
                    title="Total Exams"
                    value={stats?.totalExams || 0}
                    color="purple"
                    onClick={() => window.location.href = `/admin-exam/${userId}`}
                />
                {currentUser?.role === 'super_admin' && (
                    <StatCard
                        icon={<FaGraduationCap />}
                        title="Academic Levels"
                        value={stats?.totalLevels || 0}
                        color="yellow"
                        onClick={() => window.location.href = '/admin-sessions'}
                    />
                )}
                {currentUser?.role === 'level_admin' && (
                    <StatCard
                        icon={<FaCalendarAlt />}
                        title="Active Exams"
                        value={stats?.activeExams || 0}
                        color="red"
                    />
                )}
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

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        to={`/admin-students/${userId}`}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <FaPlus className="mr-3 text-blue-500" />
                        <div>
                            <div className="font-medium">Add Student</div>
                            <div className="text-sm text-gray-600">Register a new student</div>
                        </div>
                    </Link>
                    
                    <Link
                        to="/admin-instructors"
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <FaChalkboardTeacher className="mr-3 text-green-500" />
                        <div>
                            <div className="font-medium">Manage Instructors</div>
                            <div className="text-sm text-gray-600">View and manage instructors</div>
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

                    {currentUser?.role === 'super_admin' && (
                        <>
                            <Link
                                to="/admin-sessions"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FaCalendarAlt className="mr-3 text-yellow-500" />
                                <div>
                                    <div className="font-medium">Academic Sessions</div>
                                    <div className="text-sm text-gray-600">Manage academic levels</div>
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
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
