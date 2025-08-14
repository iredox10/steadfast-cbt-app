import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminSidebar = () => {
    const { id } = useParams();
    return (
        <Sidebar>
            <Link
                to={"/admin-sessions"}
                className="flex items-center gap-2 p-3 hover:bg-gray-100 hover:text-black rounded-lg"
            >
                <i className="fas fa-clock"></i>
                <span>Sessions</span>
            </Link>
            <Link
                to={"/admin-instructors"}
                className="flex items-center gap-2 p-3 hover:bg-gray-100 hover:text-black rounded-lg"
            >
                <i className="fas fa-chalkboard-teacher"></i>
                <span>Instructors</span>
            </Link>
            <Link
                to={`/admin-students/${id}`}
                className="flex items-center gap-2 p-3 hover:bg-gray-100 hover:text-black rounded-lg"
            >
                <i className="fas fa-user-graduate"></i>
                <span>Students</span>
            </Link>
        </Sidebar>
    );
};

export default AdminSidebar;
