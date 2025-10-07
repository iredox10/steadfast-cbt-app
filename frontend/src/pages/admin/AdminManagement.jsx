import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { path } from '../../../utils/path';
import { FaPlus, FaUsers, FaUserShield, FaCrown, FaEdit, FaTrash, FaArrowAltCircleLeft, FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';


const AdminManagement = () => {
    const navigate = useNavigate();
    const [admins, setAdmins] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [newAdmin, setNewAdmin] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'level_admin',
        level_id: ''
    });
    const [editAdmin, setEditAdmin] = useState({
        full_name: '',
        email: '',
        role: '',
        level_id: '',
        status: ''
    });
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        fetchData();
        getCurrentUser();
    }, []);

    const getCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get(`${path}/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentUser(response.data);
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch departments (acd_sessions) for level admin assignment
            const departmentsRes = await axios.get(`${path}/get-acd-sessions`, { headers });
            // Filter to only show entries that have department-related data
            const deptData = departmentsRes.data.filter(dept => dept.title);
            setDepartments(deptData);

            // Fetch admin users
            const adminsRes = await axios.get(`${path}/get-admins`, { headers });
            setAdmins(adminsRes.data);

        } catch (error) {
            console.error('Error fetching data:', error);
            setErrMsg('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleEditAdmin = (admin) => {
        setEditingAdmin(admin);
        setEditAdmin({
            id: admin.id,
            full_name: admin.full_name,
            email: admin.email,
            role: admin.role,
            level_id: admin.level_id || '',
            status: admin.status || 'active'
        });
        setShowEditModal(true);
    };

    const handleUpdateAdmin = async () => {
        setLoading(true);
        setErrMsg('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${path}/update-admin/${editAdmin.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: editAdmin.full_name,
                    email: editAdmin.email,
                    role: editAdmin.role,
                    level_id: editAdmin.level_id || null,
                    status: editAdmin.status
                })
            });

            const data = await response.json();

            if (response.ok) {
                setAdmins(admins.map(admin =>
                    admin.id === editAdmin.id ? { ...admin, ...editAdmin } : admin
                ));
                setShowEditModal(false);
                setEditingAdmin(null);
                setEditAdmin({
                    full_name: '',
                    email: '',
                    role: '',
                    level_id: '',
                    status: ''
                });
                // Refresh the admin list to get updated relationships
                fetchData();
            } else {
                setErrMsg(data.message || 'Failed to update admin');
            }
        } catch (error) {
            console.error('Error updating admin:', error);
            setErrMsg('An error occurred while updating admin');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        if (!window.confirm('Are you sure you want to delete this admin?')) {
            return;
        }

        setLoading(true);
        setErrMsg('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${path}/delete-admin/${adminId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setAdmins(admins.filter(admin => admin.id !== adminId));
            } else {
                setErrMsg(data.message || 'Failed to delete admin');
            }
        } catch (error) {
            console.error('Error deleting admin:', error);
            setErrMsg('An error occurred while deleting admin');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrMsg('');

        try {
            const token = localStorage.getItem('token');
            const endpoint = newAdmin.role === 'super_admin' ? '/create-super-admin' : '/create-level-admin';

            const response = await fetch(`${path}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newAdmin)
            });

            const data = await response.json();

            if (response.ok) {
                setAdmins([...admins, data.user || data.admin]);
                setShowCreateModal(false);
                setNewAdmin({
                    full_name: '',
                    email: '',
                    password: '',
                    role: 'level_admin',
                    level_id: ''
                });
                // Refresh the admin list
                fetchData();
            } else {
                setErrMsg(data.message || 'Failed to create admin');
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            setErrMsg('An error occurred while creating admin');
        } finally {
            setLoading(false);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'super_admin':
                return <FaCrown className="text-yellow-500" />;
            case 'level_admin':
                return <FaUserShield className="text-blue-500" />;
            default:
                return <FaUsers className="text-gray-500" />;
        }
    };

    const getRoleName = (role) => {
        switch (role) {
            case 'super_admin':
                return 'Super Admin';
            case 'level_admin':
                return 'Level Admin';
            case 'admin':
                return 'Admin';
            default:
                return role;
        }
    };

    const canCreateSuperAdmin = currentUser?.role === 'super_admin';

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div className='flex items-center gap-3'>
                    <FaArrowLeft />
                    <button onClick={() => navigate(-1)}>Go Back</button>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
                    <p className="text-gray-600 mt-2">Manage system administrators and their access levels</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    <FaPlus className="mr-2" />
                    Create Admin
                </button>
            </div>

            {
                errMsg && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {errMsg}
                    </div>
                )
            }

            {/* Admin List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">System Administrators</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admins.map(admin => (
                                <tr key={admin.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getRoleIcon(admin.role)}
                                            <span className="ml-3 font-medium text-gray-900">{admin.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{admin.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${admin.role === 'super_admin' ? 'bg-yellow-100 text-yellow-800' :
                                            admin.role === 'level_admin' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {getRoleName(admin.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {admin.level?.title || 'All Levels'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {admin.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button
                                                onClick={() => handleEditAdmin(admin)}
                                                className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded transition duration-200"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAdmin(admin.id)}
                                                className="text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition duration-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Admin Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Administrator</h3>
                                <form onSubmit={handleCreateAdmin} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newAdmin.full_name}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={newAdmin.email}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={newAdmin.password}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Role</label>
                                        <select
                                            value={newAdmin.role}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="level_admin">Level Admin</option>
                                            {canCreateSuperAdmin && <option value="super_admin">Super Admin</option>}
                                        </select>
                                    </div>
                                    {newAdmin.role === 'level_admin' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Department</label>
                                            <select
                                                value={newAdmin.level_id}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, level_id: e.target.value })}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                                required
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map(dept => (
                                                    <option key={dept.id} value={dept.id}>{dept.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                        >
                                            Create Admin
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Edit Admin Modal */}
            {
                showEditModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Admin</h3>

                                {errMsg && (
                                    <div className="mb-4 text-red-600 text-sm">
                                        {errMsg}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            value={editAdmin.full_name}
                                            onChange={(e) => setEditAdmin({ ...editAdmin, full_name: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            value={editAdmin.email}
                                            onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Role</label>
                                        <select
                                            value={editAdmin.role}
                                            onChange={(e) => setEditAdmin({ ...editAdmin, role: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="level_admin">Level Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </div>

                                    {editAdmin.role === 'level_admin' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Department</label>
                                            <select
                                                value={editAdmin.level_id}
                                                onChange={(e) => setEditAdmin({ ...editAdmin, level_id: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map((dept) => (
                                                    <option key={dept.id} value={dept.id}>
                                                        {dept.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <select
                                            value={editAdmin.status}
                                            onChange={(e) => setEditAdmin({ ...editAdmin, status: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingAdmin(null);
                                            setEditAdmin({
                                                full_name: '',
                                                email: '',
                                                role: '',
                                                level_id: '',
                                                status: ''
                                            });
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateAdmin}
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition duration-200"
                                    >
                                        {loading ? 'Updating...' : 'Update Admin'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminManagement;
