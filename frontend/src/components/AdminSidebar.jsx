import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { path } from '../../utils/path';
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
    FaEye,
    FaTicketAlt,
    FaUserPlus,
    FaQuestionCircle,
    FaBuilding,
    FaChevronDown,
    FaChevronRight,
    FaAngleRight
} from 'react-icons/fa';

const AdminSidebar = ({ userId }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openSections, setOpenSections] = useState({
        management: true,
        academics: true,
        exams: true
    });
    
    const location = useLocation();
    const navigate = useNavigate();

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin-login');
    };

    const isActiveRoute = (route) => {
        return location.pathname.includes(route);
    };

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const getLinkClass = (route) => {
        return `flex items-center p-2.5 text-sm rounded-lg transition-colors ${isActiveRoute(route)
            ? 'bg-blue-50 text-blue-600 font-medium'
            : 'text-gray-600 hover:bg-gray-50'
            }`;
    };

    const getRoleIcon = () => {
        if (currentUser?.role === 'super_admin') return <FaCrown className="text-yellow-500 mr-2" />;
        if (currentUser?.role === 'faculty_officer') return <FaBuilding className="text-blue-500 mr-2" />;
        if (currentUser?.role === 'level_admin') return <FaUserShield className="text-blue-500 mr-2" />;
        return null;
    };

    const SidebarLink = ({ to, icon, label }) => (
        <Link to={to} className={getLinkClass(to.replace('/', ''))}>
            <span className="mr-3 text-lg opacity-80">{icon}</span>
            <span>{label}</span>
        </Link>
    );

    const SidebarSection = ({ title, id, children }) => (
        <div className="mb-4">
            <button 
                onClick={() => toggleSection(id)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
            >
                {title}
                {openSections[id] ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
            </button>
            {openSections[id] && (
                <div className="space-y-1 mt-1 px-2">
                    {children}
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <aside className="w-64 bg-white p-6 flex-shrink-0 border-r border-gray-200">
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-8 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </aside>
        );
    }

    return (
        <aside className="w-64 bg-white flex flex-col flex-shrink-0 border-r border-gray-200 h-screen sticky top-0">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center mb-4">
                    <img src="/assets/buk.png" alt="Logo" className="h-8 w-8 mr-3 object-contain" />
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">Admin Panel</h1>
                        {currentUser && (
                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                {getRoleIcon()}
                                <span className="truncate max-w-[120px]">
                                    {currentUser.role === 'super_admin' ? 'Super Admin' :
                                     currentUser.role === 'faculty_officer' ? 'Faculty Officer' :
                                     currentUser.role === 'level_admin' ? 'Dept Officer' :
                                     currentUser.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                
                {currentUser && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{currentUser.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        {currentUser.role === 'faculty_officer' && currentUser.faculty?.name && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Faculty</p>
                                <p className="text-xs text-blue-600 font-medium truncate" title={currentUser.faculty.name}>
                                    {currentUser.faculty.name}
                                </p>
                            </div>
                        )}
                        {currentUser.role === 'level_admin' && currentUser.level?.title && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Department</p>
                                <p className="text-xs text-blue-600 font-medium truncate" title={currentUser.level.title}>
                                    {currentUser.level.title}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Scrollable Navigation */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar p-4">
                <SidebarLink 
                    to={`/admin-dashboard/${userId}`} 
                    icon={<FaListAlt />} 
                    label="Dashboard" 
                />

                <div className="my-4 border-t border-gray-100"></div>

                {/* Management Section */}
                <SidebarSection title="Management" id="management">
                    {currentUser?.role === 'super_admin' && (
                        <>
                            <SidebarLink to="/faculty-management" icon={<FaBuilding />} label="Faculties" />
                            <SidebarLink to="/department-management" icon={<FaGraduationCap />} label="Departments" />
                            <SidebarLink to="/global-session-management" icon={<FaCrown />} label="Global Session" />
                            <SidebarLink to="/admin-management" icon={<FaUserShield />} label="Admins" />
                        </>
                    )}

                    {currentUser?.role === 'faculty_officer' && (
                        <>
                            <SidebarLink to="/department-management" icon={<FaGraduationCap />} label="Departments" />
                            <SidebarLink to="/admin-management" icon={<FaUserShield />} label="Dept Officers" />
                        </>
                    )}

                    {currentUser?.role === 'level_admin' && (
                        <>
                            <SidebarLink to="/admin-sessions" icon={<FaCalendarAlt />} label="Academic Session" />
                            <SidebarLink to="/level-admin-courses" icon={<FaBook />} label="Courses" />
                        </>
                    )}
                </SidebarSection>

                {/* People Section */}
                <SidebarSection title="People" id="academics">
                    <SidebarLink to={`/admin-students/${userId}`} icon={<FaUsers />} label="Students" />
                    <SidebarLink to={`/admin-instructors/${userId}`} icon={<FaChalkboardTeacher />} label="Instructors" />
                    {currentUser?.role === 'level_admin' && (
                        <SidebarLink to="/level-admin-courses" icon={<FaUserPlus />} label="Enrollments" />
                    )}
                </SidebarSection>

                {/* Exams Section */}
                <SidebarSection title="Examinations" id="exams">
                    <SidebarLink to={`/admin-exam/${userId}`} icon={<FaBook />} label="Exams" />
                    <SidebarLink to={`/admin-tickets/${userId}`} icon={<FaTicketAlt />} label="Tickets" />
                    <SidebarLink to="/exam-archives" icon={<FaEye />} label="Archives" />
                </SidebarSection>
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 bg-white">
                {currentUser && (
                    <Link
                        to={`/manual/${currentUser.role}`}
                        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mb-1"
                    >
                        <FaQuestionCircle className="mr-3" /> User Manual
                    </Link>
                )}
                
                {(currentUser?.role === 'super_admin' || currentUser?.role === 'faculty_officer' || currentUser?.role === 'level_admin') && (
                    <Link
                        to={`/admin-settings/${userId}`}
                        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mb-1"
                    >
                        <FaCog className="mr-3" /> Settings
                    </Link>
                )}
                
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
                >
                    <FaSignOutAlt className="mr-3" /> Logout
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;