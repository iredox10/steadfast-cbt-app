import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { path } from '../../../utils/path';
import { FaPlus, FaUsers, FaUserShield, FaCrown, FaEdit, FaTrash, FaArrowAltCircleLeft, FaArrowLeft, FaKey, FaFileUpload } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';


const AdminManagement = () => {
    const navigate = useNavigate();
    const [admins, setAdmins] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [adminToReset, setAdminToReset] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [editingAdmin, setEditingAdmin] = useState(null);

    const confirmResetPassword = (admin) => {
        setAdminToReset(admin);
        setShowResetPasswordModal(true);
    };

    const handleResetPassword = async () => {
        if (!adminToReset) return;

        setLoading(true);
        setErrMsg('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${path}/reset-admin-password/${adminToReset.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                // Close modal and reset state
                setShowResetPasswordModal(false);
                setAdminToReset(null);
                // Optional: Show a success toast or message if you have a global notification system
                // For now, we can use a simple alert if the user is okay with it for success, 
                // or just rely on the modal closing as feedback. 
                // The user asked to remove the alert, so we'll just close the modal.
            } else {
                setErrMsg(data.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            setErrMsg('An error occurred while resetting password');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadSample = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${path}/download-sample-admins-import`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'sample_admins_import.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading sample file:', error);
            setErrMsg('Failed to download sample file');
        }
    };



    const [currentUser, setCurrentUser] = useState(null);

    // Search and Pagination states
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalAdmins, setTotalAdmins] = useState(0);

    const [newAdmin, setNewAdmin] = useState({
        full_name: '',
        email: '',
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
    }, [currentPage, searchQuery]); // Refetch when page or search changes

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Only trigger fetchData if searchQuery is not empty, or if it's empty and we need to reset
            if (searchQuery !== '') {
                setCurrentPage(1); // Reset to page 1 on new search
                fetchData();
            } else if (searchQuery === '') { // If search query is cleared, also refetch from page 1
                setCurrentPage(1);
                fetchData();
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

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

            // Fetch departments (filtered to exclude academic sessions)
            // Only fetch departments once
            if (departments.length === 0) {
                const departmentsRes = await axios.get(`${path}/departments?status=active`, { headers });
                setDepartments(departmentsRes.data);
            }

            // Fetch admin users with pagination and search
            const queryParams = new URLSearchParams({
                page: currentPage,
                per_page: perPage,
                search: searchQuery
            });

            const adminsRes = await axios.get(`${path}/get-admins?${queryParams}`, { headers });

            // Handle paginated response
            if (adminsRes.data.data) {
                setAdmins(adminsRes.data.data);
                setTotalPages(adminsRes.data.last_page);
                setTotalAdmins(adminsRes.data.total);
            } else {
                // Fallback for non-paginated response (backward compatibility)
                setAdmins(adminsRes.data);
                setTotalAdmins(adminsRes.data.length); // Estimate total if not paginated
                setTotalPages(1); // Assume 1 page if not paginated
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            setErrMsg('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
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
                // Refresh the admin list to get updated relationships and pagination
                fetchData();
                setShowEditModal(false);
                setEditingAdmin(null);
                setEditAdmin({
                    full_name: '',
                    email: '',
                    role: '',
                    level_id: '',
                    status: ''
                });
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
                setTotalAdmins(prev => prev - 1);
                // If the current page becomes empty after deletion, go to the previous page
                if (admins.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchData(); // Refresh to update pagination if needed
                }
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
                // Refresh to show new admin (might be on a different page, but fetching ensures consistency)
                fetchData();
                setShowCreateModal(false);
                setNewAdmin({
                    full_name: '',
                    email: '',
                    role: 'level_admin',
                    level_id: ''
                });
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

    // handleResetPassword moved up and modified

    const handleImportAdmins = async (e) => {
        e.preventDefault();
        if (!importFile) {
            setErrMsg('Please select a file to import');
            return;
        }

        setLoading(true);
        setErrMsg('');

        const formData = new FormData();
        formData.append('file', importFile);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${path}/import-admins`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                alert('Admins imported successfully');
                setShowImportModal(false);
                setImportFile(null);
                fetchData();
            } else {
                setErrMsg('Failed to import admins');
            }
        } catch (error) {
            console.error('Error importing admins:', error);
            setErrMsg(error.response?.data?.message || 'An error occurred while importing admins');
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

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar userId={currentUser?.id} />

            <div className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
                            <p className="text-gray-600 mt-2">Manage system administrators and their access levels</p>
                        </div>
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 mr-2"
                        >
                            <FaFileUpload className="mr-2" />
                            Import Admins
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            <FaPlus className="mr-2" />
                            Create Admin
                        </button>
                    </div>

                    {errMsg && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {errMsg}
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search admins by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Admin List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">System Administrators</h2>
                            <span className="text-sm text-gray-500">Total: {totalAdmins}</span>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {admins.length > 0 ? (
                                                admins.map(admin => (
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
                                                                    onClick={() => confirmResetPassword(admin)}
                                                                    className="text-yellow-600 hover:text-yellow-800 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded transition duration-200"
                                                                    title="Reset Password"
                                                                >
                                                                    <FaKey />
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
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                        No admins found matching your search.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                        <div className="flex-1 flex justify-between sm:hidden">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                            >
                                                Next
                                            </button>
                                        </div>
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                    <button
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                                    >
                                                        <span className="sr-only">Previous</span>
                                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>

                                                    {/* Page Numbers */}
                                                    {[...Array(totalPages)].map((_, i) => {
                                                        const pageNum = i + 1;
                                                        // Show first, last, current, and neighbors
                                                        if (
                                                            pageNum === 1 ||
                                                            pageNum === totalPages ||
                                                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                                        ) {
                                                            return (
                                                                <button
                                                                    key={pageNum}
                                                                    onClick={() => handlePageChange(pageNum)}
                                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            );
                                                        } else if (
                                                            // Show ellipses if there's a gap
                                                            (pageNum === currentPage - 2 && currentPage > 3) ||
                                                            (pageNum === currentPage + 2 && currentPage < totalPages - 2)
                                                        ) {
                                                            return (
                                                                <span key={pageNum} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                                    ...
                                                                </span>
                                                            );
                                                        }
                                                        return null;
                                                    })}

                                                    <button
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                                    >
                                                        <span className="sr-only">Next</span>
                                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
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
                                            {/* Password field removed - auto-generated */}
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
                    {/* Import Admin Modal */}
                    {
                        showImportModal && (
                            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                    <div className="mt-3">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Import Admins</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Upload an Excel or CSV file with columns: Full Name, Email, Role, Level ID (optional).
                                            <button
                                                onClick={handleDownloadSample}
                                                className="text-blue-600 hover:text-blue-800 ml-2 underline"
                                                type="button"
                                            >
                                                Download Sample File
                                            </button>
                                        </p>
                                        <form onSubmit={handleImportAdmins} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Select File</label>
                                                <input
                                                    type="file"
                                                    accept=".xlsx,.xls,.csv"
                                                    onChange={(e) => setImportFile(e.target.files[0])}
                                                    className="mt-1 block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100"
                                                    required
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-3 mt-6">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowImportModal(false);
                                                        setImportFile(null);
                                                    }}
                                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                                >
                                                    Import
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {/* Reset Password Modal */}
                    {
                        showResetPasswordModal && (
                            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                    <div className="mt-3 text-center">
                                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                                            <FaKey className="h-6 w-6 text-yellow-600" />
                                        </div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Reset Password</h3>
                                        <div className="mt-2 px-7 py-3">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to reset the password for <strong>{adminToReset?.full_name}</strong>?
                                                It will be set to default "password".
                                            </p>
                                        </div>
                                        <div className="items-center px-4 py-3">
                                            <button
                                                onClick={handleResetPassword}
                                                className="px-4 py-2 bg-yellow-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                            >
                                                Reset Password
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowResetPasswordModal(false);
                                                    setAdminToReset(null);
                                                }}
                                                className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default AdminManagement;
