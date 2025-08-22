import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { path } from '../../../utils/path';
import { 
    FaCalendarAlt, 
    FaUsers, 
    FaBook, 
    FaChalkboardTeacher, 
    FaCog, 
    FaSignOutAlt, 
    FaListAlt, 
    FaUserShield, 
    FaCrown,
    FaGraduationCap,
    FaEye
} from 'react-icons/fa';

const AdminSidebar = ({ userId }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        fetchCurrentUser();
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
            setLoading(false);
        }
    };

    const isActiveRoute = (route) => {
        return location.pathname.includes(route);
    };

    const getLinkClass = (route) => {
        return `flex items-center p-3 rounded-lg transition-colors ${
            isActiveRoute(route) 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
        }`;
    };

    const getRoleIcon = () => {
        if (currentUser?.role === 'super_admin') {
            return <FaCrown className="text-yellow-500 mr-2" />;
        } else if (currentUser?.role === 'level_admin') {
            return <FaUserShield className="text-blue-500 mr-2" />;
        }
        return null;
    };

    if (loading) {
        return (
            <aside className="w-64 bg-white p-6 flex-shrink-0 border-r border-gray-200">
                <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-8 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </aside>
        );
    }

    return (
        <aside className="w-64 bg-white p-6 flex-shrink-0 border-r border-gray-200">
            {/* Header */}
            <div className="flex items-center mb-8">
                <img src="/assets/buk.png" alt="School Logo" className="h-10 w-10 mr-3" />
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                    {currentUser && (
                        <div className="flex items-center text-sm text-gray-600">
                            {getRoleIcon()}
                            {currentUser.role === 'super_admin' && 'Super Admin'}
                            {currentUser.role === 'level_admin' && 'Level Admin'}
                            {currentUser.role === 'admin' && 'Admin'}
                        </div>
                    )}
                </div>
            </div>

            {/* User Info */}
            {currentUser && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{currentUser.full_name}</p>
                    <p className="text-xs text-gray-600">{currentUser.email}</p>
                    {currentUser.role === 'level_admin' && currentUser.level?.title && (
                        <p className="text-xs text-blue-600 mt-1">Level: {currentUser.level.title}</p>
                    )}
                </div>
            )}

            {/* Navigation */}
            <nav className="space-y-2 flex-1">
                {/* Dashboard */}
                <Link 
                    to={`/admin-dashboard/${userId}`} 
                    className={getLinkClass('admin-dashboard')}
                >
                    <FaListAlt className="mr-3" /> Dashboard
                </Link>

                {/* Academic Sessions - Super Admin only */}
                {currentUser?.role === 'super_admin' && (
                    <Link 
                        to="/admin-sessions" 
                        className={getLinkClass('admin-sessions')}
                    >
                        <FaCalendarAlt className="mr-3" /> Academic Sessions
                    </Link>
                )}

                {/* Students */}
                <Link 
                    to={`/admin-students/${userId}`} 
                    className={getLinkClass('admin-students')}
                >
                    <FaUsers className="mr-3" /> Students
                </Link>

                {/* Instructors */}
                <Link 
                    to="/admin-instructors" 
                    className={getLinkClass('admin-instructors')}
                >
                    <FaChalkboardTeacher className="mr-3" /> Instructors
                </Link>

                {/* Exams */}
                <Link 
                    to={`/admin-exam/${userId}`} 
                    className={getLinkClass('admin-exam')}
                >
                    <FaBook className="mr-3" /> Exams
                </Link>

                {/* Exam Archives */}
                <Link 
                    to="/exam-archives" 
                    className={getLinkClass('exam-archives')}
                >
                    <FaEye className="mr-3" /> Exam Archives
                </Link>

                {/* Admin Management - Super Admin and Level Admin only */}
                {(currentUser?.role === 'super_admin' || currentUser?.role === 'level_admin') && (
                    <Link 
                        to="/admin-management" 
                        className={getLinkClass('admin-management')}
                    >
                        <FaUserShield className="mr-3" /> Admin Management
                    </Link>
                )}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto pt-6 border-t border-gray-200">
                <Link 
                    to="#" 
                    className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mb-2"
                >
                    <FaCog className="mr-3" /> Settings
                </Link>
                <Link 
                    to="/admin-login" 
                    className="flex items-center p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <FaSignOutAlt className="mr-3" /> Logout
                </Link>
            </div>
        </aside>
    );
};

export default AdminSidebar;
