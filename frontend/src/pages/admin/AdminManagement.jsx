import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { path } from '../../../utils/path';
import { FaPlus, FaUsers, FaUserShield, FaCrown, FaEdit, FaTrash, FaArrowAltCircleLeft, FaArrowLeft, FaKey, FaFileUpload, FaSearch, FaBuilding, FaGraduationCap, FaTimes, FaDownload, FaUpload } from 'react-icons/fa';
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
            const response = await axios.post(`${path}/reset-admin-password/${adminToReset.id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                setShowResetPasswordModal(false);
                setAdminToReset(null);
                alert(`Password for ${adminToReset.full_name} reset successfully to "password"`);
            } else {
                setErrMsg(response.data.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            setErrMsg(error.response?.data?.message || 'An error occurred while resetting password');
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
        level_id: '',
        faculty_id: ''
    });
    const [editAdmin, setEditAdmin] = useState({
        full_name: '',
        email: '',
        role: '',
        level_id: '',
        faculty_id: '',
        status: ''
    });
    const [errMsg, setErrMsg] = useState('');
    const [faculties, setFaculties] = useState([]);

    useEffect(() => {
        const init = async () => {
            await getCurrentUser();
        };
        init();
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchData();
            if (currentUser.role === 'super_admin') {
                fetchFaculties();
            }
        }
    }, [currentPage, searchQuery, currentUser]);

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery !== '') {
                setCurrentPage(1);
                fetchData();
            } else if (searchQuery === '' && !loading) {
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

    const fetchFaculties = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${path}/faculties`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFaculties(res.data);
        } catch (err) {
            console.error('Failed to fetch faculties');
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch departments (filtered to exclude academic sessions)
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
            if (adminsRes.data && adminsRes.data.data) {
                setAdmins(adminsRes.data.data);
                setTotalPages(adminsRes.data.last_page);
                setTotalAdmins(adminsRes.data.total);
            } else {
                setAdmins(Array.isArray(adminsRes.data) ? adminsRes.data : []);
                setTotalAdmins(Array.isArray(adminsRes.data) ? adminsRes.data.length : 0);
                setTotalPages(1);
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
            faculty_id: admin.faculty_id || '',
            status: admin.status || 'active'
        });
        setShowEditModal(true);
    };

    const handleUpdateAdmin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrMsg('');

        try {
            const token = localStorage.getItem('token');
            const payload = {
                full_name: editAdmin.full_name,
                email: editAdmin.email,
                role: editAdmin.role,
                status: editAdmin.status,
                level_id: editAdmin.role === 'level_admin' ? editAdmin.level_id : null,
                faculty_id: editAdmin.role === 'faculty_officer' ? editAdmin.faculty_id : null
            };

            const response = await axios.put(`${path}/update-admin/${editAdmin.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                fetchData();
                setShowEditModal(false);
                setEditingAdmin(null);
                setEditAdmin({
                    full_name: '',
                    email: '',
                    role: '',
                    level_id: '',
                    faculty_id: '',
                    status: ''
                });
            } else {
                setErrMsg(response.data.message || 'Failed to update admin');
            }
        } catch (error) {
            console.error('Error updating admin:', error);
            setErrMsg(error.response?.data?.message || 'An error occurred while updating admin');
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
            const response = await axios.delete(`${path}/delete-admin/${adminId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                setAdmins(admins.filter(admin => admin.id !== adminId));
                setTotalAdmins(prev => prev - 1);
                if (admins.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchData();
                }
            } else {
                setErrMsg(response.data.message || 'Failed to delete admin');
            }
        } catch (error) {
            console.error('Error deleting admin:', error);
            setErrMsg(error.response?.data?.message || 'An error occurred while deleting admin');
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
            let endpoint = '/create-level-admin';
            if (newAdmin.role === 'super_admin') endpoint = '/create-super-admin';
            if (newAdmin.role === 'faculty_officer') endpoint = '/create-faculty-officer';

            const payload = { ...newAdmin };
            if (newAdmin.role !== 'faculty_officer') delete payload.faculty_id;
            if (newAdmin.role !== 'level_admin') delete payload.level_id;

            const response = await axios.post(`${path}${endpoint}`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200 || response.status === 201) {
                fetchData();
                setShowCreateModal(false);
                setNewAdmin({
                    full_name: '',
                    email: '',
                    role: 'level_admin',
                    level_id: '',
                    faculty_id: ''
                });
            } else {
                setErrMsg(response.data.message || 'Failed to create admin');
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            setErrMsg(error.response?.data?.message || 'An error occurred while creating admin');
        } finally {
            setLoading(false);
        }
    };

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

    const getRoleName = (role) => {
        switch (role) {
            case 'super_admin':
                return 'Super Admin';
            case 'level_admin':
                return 'Dept Officer';
            case 'faculty_officer':
                return 'Faculty Officer';
            case 'admin':
                return 'Admin';
            default:
                return role;
        }
    };

    const canCreateSuperAdmin = currentUser?.role === 'super_admin';
    const pageTitle = currentUser?.role === 'faculty_officer' ? 'Department Officers' : 'Admin Management';
    const pageDescription = currentUser?.role === 'faculty_officer' 
        ? 'Manage officers for departments within your faculty'
        : 'Manage system administrators and their access levels';

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <AdminSidebar userId={currentUser?.id} />

            <div className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <FaUserShield className="mr-3 text-blue-600" />
                                {pageTitle}
                            </h1>
                            <p className="text-gray-500 mt-1">{pageDescription}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
                            >
                                <FaFileUpload className="mr-2 text-green-600" />
                                Import
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all"
                            >
                                <FaPlus className="mr-2" />
                                Create New
                            </button>
                        </div>
                    </div>

                    {errMsg && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-sm flex items-center">
                            <FaTrash className="mr-2" /> {errMsg}
                        </div>
                    )}

                    {/* Search and Filter Bar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                <FaSearch />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignment</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {admins.length > 0 ? (
                                                admins.map(admin => (
                                                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg">
                                                                    {admin.full_name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">{admin.full_name}</div>
                                                                    <div className="text-sm text-gray-500">{admin.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                ${admin.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                                                  admin.role === 'faculty_officer' ? 'bg-indigo-100 text-indigo-800' :
                                                                  admin.role === 'level_admin' ? 'bg-blue-100 text-blue-800' :
                                                                  'bg-gray-100 text-gray-800'}`}>
                                                                {getRoleName(admin.role)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {admin.role === 'faculty_officer' && admin.faculty ? (
                                                                <span className="flex items-center gap-1 text-indigo-600 font-medium">
                                                                    <FaBuilding size={12} /> {admin.faculty.name}
                                                                </span>
                                                            ) : admin.level ? (
                                                                <span className="flex items-center gap-1 text-blue-600 font-medium">
                                                                    <FaGraduationCap size={12} /> {admin.level.title}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 italic">Global Access</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                ${admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {admin.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleEditAdmin(admin)}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <FaEdit />
                                                                </button>
                                                                <button
                                                                    onClick={() => confirmResetPassword(admin)}
                                                                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                                                                    title="Reset Password"
                                                                >
                                                                    <FaKey />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteAdmin(admin.id)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                                            <FaUsers className="text-4xl mb-3 text-gray-300" />
                                                            <p className="text-lg font-medium">No administrators found</p>
                                                            <p className="text-sm">Try adjusting your search or create a new admin.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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
                                                        Previous
                                                    </button>
                                                    {[...Array(totalPages)].map((_, i) => (
                                                        <button
                                                            key={i + 1}
                                                            onClick={() => handlePageChange(i + 1)}
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                                currentPage === i + 1
                                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    ))}
                                                    <button
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                                    >
                                                        Next
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
                    {showCreateModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                                <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900">Create New {currentUser?.role === 'faculty_officer' ? 'Department Officer' : 'Administrator'}</h3>
                                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                                </div>
                                <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newAdmin.full_name}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={newAdmin.email}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select
                                            value={newAdmin.role}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value, level_id: '', faculty_id: '' })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="level_admin">Department Officer</option>
                                            {canCreateSuperAdmin && <option value="faculty_officer">Faculty Officer</option>}
                                            {canCreateSuperAdmin && <option value="super_admin">Super Admin</option>}
                                        </select>
                                    </div>

                                    {newAdmin.role === 'faculty_officer' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                                            <select
                                                value={newAdmin.faculty_id}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, faculty_id: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Faculty</option>
                                                {faculties.map(faculty => (
                                                    <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {newAdmin.role === 'level_admin' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                            <select
                                                value={newAdmin.level_id}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, level_id: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map(dept => (
                                                    <option key={dept.id} value={dept.id}>{dept.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Create
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Edit Admin Modal */}
                    {showEditModal && editingAdmin && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                                <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900">Edit Admin</h3>
                                    <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                                </div>
                                <form onSubmit={handleUpdateAdmin} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={editAdmin.full_name}
                                            onChange={(e) => setEditAdmin({ ...editAdmin, full_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={editAdmin.email}
                                            onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select
                                            value={editAdmin.role}
                                            onChange={(e) => setEditAdmin({ ...editAdmin, role: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="level_admin">Department Officer</option>
                                            <option value="super_admin">Super Admin</option>
                                            <option value="faculty_officer">Faculty Officer</option>
                                        </select>
                                    </div>

                                    {editAdmin.role === 'faculty_officer' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                                            <select
                                                value={editAdmin.faculty_id}
                                                onChange={(e) => setEditAdmin({ ...editAdmin, faculty_id: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Faculty</option>
                                                {faculties.map(faculty => (
                                                    <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {editAdmin.role === 'level_admin' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                            <select
                                                value={editAdmin.level_id}
                                                onChange={(e) => setEditAdmin({ ...editAdmin, level_id: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={editAdmin.status}
                                            onChange={(e) => setEditAdmin({ ...editAdmin, status: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowEditModal(false)}
                                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            {loading ? 'Updating...' : 'Update Admin'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Import Admin Modal */}
                    {
                        showImportModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-900">Import Admins</h3>
                                        <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                                            <p className="text-sm text-blue-800 mb-2 font-medium">Instructions:</p>
                                            <p className="text-xs text-blue-600 mb-3">
                                                Upload an Excel file (.xlsx) with columns: Full Name, Email, Role, Level ID, Faculty ID.
                                            </p>
                                            <button
                                                onClick={handleDownloadSample}
                                                className="flex items-center text-xs font-bold text-blue-700 hover:text-blue-900"
                                            >
                                                <FaDownload className="mr-1" /> Download Template
                                            </button>
                                        </div>
                                        <form onSubmit={handleImportAdmins} className="space-y-4">
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                                                <input
                                                    type="file"
                                                    accept=".xlsx,.xls,.csv"
                                                    onChange={(e) => setImportFile(e.target.files[0])}
                                                    className="hidden"
                                                    id="file-upload"
                                                    required
                                                />
                                                <label htmlFor="file-upload" className="cursor-pointer">
                                                    <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                                                    <span className="text-sm text-gray-600">{importFile ? importFile.name : "Click to upload Excel file"}</span>
                                                </label>
                                            </div>
                                            <div className="flex justify-end gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowImportModal(false);
                                                        setImportFile(null);
                                                    }}
                                                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
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
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-center p-6">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaKey className="text-yellow-600 text-xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Reset Password?</h3>
                                    <p className="text-sm text-gray-500 mb-6">
                                        This will reset the password for <strong>{adminToReset?.full_name}</strong> to the default "password".
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => setShowResetPasswordModal(false)}
                                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleResetPassword}
                                            className="px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                                        >
                                            Confirm Reset
                                        </button>
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