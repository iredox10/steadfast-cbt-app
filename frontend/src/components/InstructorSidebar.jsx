import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { FaTachometerAlt, FaBook, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';
import logo from '../../public/assets/buk.png';

const SidebarNavLink = ({ to, icon, text }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center space-x-4 px-6 py-3 rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-blue-700 text-white shadow-inner'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`
        }
    >
        {icon}
        <span className="font-medium">{text}</span>
    </NavLink>
);

const InstructorSidebar = () => {
    const { id: userId } = useParams();

    const navLinks = [
        { to: `/instructor/${userId}`, icon: <FaTachometerAlt className="text-xl" />, text: 'Dashboard' },
        { to: `/question-bank/${userId}`, icon: <FaBook className="text-xl" />, text: 'Question Bank' },
    ];

    return (
        <div className="w-72 bg-gray-800 text-white flex flex-col h-screen shadow-2xl">
            <div className="flex items-center justify-center p-6 border-b border-gray-700">
                <img src={logo} className="w-16 h-16 object-contain" alt="HUK POLY Logo" />
                <h1 className="text-xl font-bold ml-4">Steadfast CBT</h1>
            </div>

            <nav className="flex-1 px-6 py-8 space-y-4">
                {navLinks.map((link) => (
                    <SidebarNavLink key={link.to} {...link} />
                ))}
            </nav>

            <div className="px-6 py-6 border-t border-gray-700 space-y-4">
                <SidebarNavLink to="/admin-login" icon={<FaSignOutAlt className="text-xl" />} text="Logout" />
                <SidebarNavLink to="/help" icon={<FaQuestionCircle className="text-xl" />} text="Help Center" />
            </div>
        </div>
    );
};

export default InstructorSidebar;
