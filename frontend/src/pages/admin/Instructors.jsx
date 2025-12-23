import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { path } from '../../../utils/path';
import {
    FaPlus,
    FaEdit,
    FaTimes,
    FaUserPlus,
    FaChalkboardTeacher,
    FaUpload,
    FaDownload,
    FaKey,
    FaSearch,
    FaTrash,
    FaFileUpload
} from 'react-icons/fa';
import AdminSidebar from '../../components/AdminSidebar';
import * as XLSX from 'xlsx';

const Instructors = () => {
    const { userId } = useParams();
    const [instructors, setInstructors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [newInstructor, setNewInstructor] = useState({
        full_name: '',
        email: '',
        role: 'lecturer',
        status: 'active',
        level_id: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [instructorToReset, setInstructorToReset] = useState(null);
    const [errMsg, setErrMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

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

            // Fetch departments
            const departmentsRes = await axios.get(`${path}/departments`, { headers });
            setDepartments(departmentsRes.data);

            // Fetch instructors
            const instructorsRes = await axios.get(`${path}/get-users`, { headers });
            setInstructors(instructorsRes.data);

        } catch (error) {
            console.error('Error fetching data:', error);
            setErrMsg('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInstructor = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrMsg('');
        setSuccessMsg('');

        try {
            const token = localStorage.getItem('token');
            const instructorData = { ...newInstructor };

            // For level admins, level_id will be automatically set by backend
            // For super admins, use the selected level_id
            if (currentUser?.role !== 'level_admin' && newInstructor.level_id) {
                instructorData.level_id = newInstructor.level_id;
            }

            const response = await axios.post(`${path}/add-user`, instructorData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.user) {
                setInstructors([...instructors, response.data.user]);
                setShowCreateModal(false);
                setNewInstructor({
                    full_name: '',
                    email: '',
                    role: 'lecturer',
                    status: 'active',
                    level_id: ''
                });
                setSuccessMsg('Instructor created successfully');
                fetchData();
            }
        } catch (error) {
            console.error('Error creating instructor:', error);
            setErrMsg(error.response?.data?.error || error.response?.data?.message || 'Failed to create instructor');
        } finally {
            setLoading(false);
        }
    };

    const handleImportInstructors = async (e) => {
        e.preventDefault();
        if (!file) {
            setErrMsg("Please select a file to upload.");
            return;
        }
        setIsUploading(true);
        setErrMsg("");
        setSuccessMsg("");

        const formData = new FormData();
        formData.append("excel_file", file);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${path}/upload-instructors-excel`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });
            setSuccessMsg('Instructors imported successfully!');
            setShowImportModal(false);
            setFile(null);
            fetchData();
        } catch (error) {
            console.error("Error uploading file:", error);
            setErrMsg(error.response?.data?.error || "Error uploading file.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                'Full Name': 'Jane Smith',
                'Email': 'jane.smith@example.com',
                'Password': 'securePassword123',
                'Role': 'lecturer',
                'Status': 'active'
            }
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(templateData);

        ws['!cols'] = [
            { wch: 20 },
            { wch: 30 },
            { wch: 20 },
            { wch: 15 },
            { wch: 12 }
        ];

        if (!ws['!dataValidation']) ws['!dataValidation'] = [];

        ws['!dataValidation'].push({
            type: 'list',
            allowBlank: false,
            sqref: 'D2:D1000',
            formulas: ['"lecturer,invigilator"']
        });

        ws['!dataValidation'].push({
            type: 'list',
            allowBlank: false,
            sqref: 'E2:E1000',
            formulas: ['"active,inactive"']
        });

        XLSX.utils.book_append_sheet(wb, ws, 'Instructors');
        XLSX.writeFile(wb, 'instructor_import_template.xlsx');
    };

    const handleStatusChange = async (instructorId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${path}/update-instructor-status/${instructorId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const dbStatus = newStatus === 'inactive' ? 'not_active' : newStatus;
            setInstructors(instructors.map(inst =>
                inst.id === instructorId ? { ...inst, status: dbStatus } : inst
            ));

            setSuccessMsg('Status updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error('Error updating status:', error);
            setErrMsg('Failed to update status');
            setTimeout(() => setErrMsg(''), 3000);
        }
    };

    const handleUpdateInstructor = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(`${path}/update-user/${editingInstructor.id}`, editingInstructor, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setInstructors(instructors.map(inst =>
                inst.id === editingInstructor.id ? response.data.user : inst
            ));
            setShowEditModal(false);
            setEditingInstructor(null);
            setSuccessMsg('Instructor updated successfully');
        } catch (error) {
            setErrMsg(error.response?.data?.error || 'Failed to update instructor');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${path}/reset-user-password/${instructorToReset.id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMsg(`Password for ${instructorToReset.full_name} reset successfully to 'password'`);
            setShowResetPasswordModal(false);
            setInstructorToReset(null);
        } catch (error) {
            setErrMsg(error.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const filteredInstructors = instructors.filter(instructor =>
        instructor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleDisplay = (role) => {
        switch (role) {
            case 'lecturer': return 'Lecturer';
            case 'invigilator': return 'Invigilator';
            case 'instructor': return 'Instructor';
            default: return role;
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentInstructors = filteredInstructors.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar userId={userId} />
                <div className="flex-1 flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <AdminSidebar userId={userId} />

            <div className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <FaChalkboardTeacher className="mr-3 text-blue-600" />
                                Instructor Management
                            </h1>
                            <p className="text-gray-500 mt-1">Manage instructors, lecturers, and invigilators</p>
                        </div>
                        <div className="flex gap-3">
                            {(currentUser?.role === 'super_admin' || currentUser?.role === 'level_admin') && (
                                <>
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
                                        Add Instructor
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {errMsg && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-sm flex items-center">
                            <FaTimes className="mr-2" /> {errMsg}
                        </div>
                    )}
                    {successMsg && (
                        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 shadow-sm flex items-center">
                            <FaUserPlus className="mr-2" /> {successMsg}
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                <FaSearch />
                            </div>
                        </div>
                    </div>

                    {/* Instructors Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        {currentUser?.role === 'level_admin' && (
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentInstructors.length === 0 ? (
                                        <tr>
                                            <td colSpan={currentUser?.role === 'level_admin' ? 4 : 3} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <FaChalkboardTeacher className="text-4xl mb-3 text-gray-300" />
                                                    <p className="text-lg font-medium">No instructors found</p>
                                                    <p className="text-sm mt-1">Try adjusting your search or add a new instructor.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentInstructors.map((instructor) => (
                                            <tr key={instructor.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                            {instructor.full_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{instructor.full_name}</div>
                                                            <div className="text-sm text-gray-500">{instructor.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${instructor.role === 'lecturer' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                                        {getRoleDisplay(instructor.role)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={instructor.status === 'not_active' ? 'inactive' : instructor.status}
                                                        onChange={(e) => handleStatusChange(instructor.id, e.target.value)}
                                                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-offset-2 cursor-pointer outline-none ${instructor.status === 'active'
                                                            ? 'bg-green-100 text-green-800 focus:ring-green-500'
                                                            : 'bg-red-100 text-red-800 focus:ring-red-500'
                                                            }`}
                                                        disabled={currentUser?.role !== 'level_admin'}
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                </td>
                                                {currentUser?.role === 'level_admin' && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-2">
                                                            {instructor.role === 'lecturer' && (
                                                                <Link
                                                                    to={`/assign-courses/${instructor.id}`}
                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                                    title="Assign Course"
                                                                >
                                                                    <FaUserPlus />
                                                                </Link>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    setEditingInstructor(instructor);
                                                                    setShowEditModal(true);
                                                                }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                                title="Edit"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setInstructorToReset(instructor);
                                                                    setShowResetPasswordModal(true);
                                                                }}
                                                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                                                                title="Reset Password"
                                                            >
                                                                <FaKey />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
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
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            Previous
                                        </button>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => paginate(i + 1)}
                                                className={`px-3 py-1 border rounded-md text-sm font-medium ${
                                                    currentPage === i + 1
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals remain mostly the same structure but cleaner */}
            {/* Create Instructor Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Add New Instructor</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleCreateInstructor} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={newInstructor.full_name}
                                    onChange={(e) => setNewInstructor({ ...newInstructor, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newInstructor.email}
                                    onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={newInstructor.role}
                                    onChange={(e) => setNewInstructor({ ...newInstructor, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="lecturer">Lecturer</option>
                                    <option value="invigilator">Invigilator</option>
                                </select>
                            </div>
                            {currentUser?.role !== 'level_admin' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select
                                        value={newInstructor.level_id}
                                        onChange={(e) => setNewInstructor({ ...newInstructor, level_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>{dept.title}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={newInstructor.status}
                                    onChange={(e) => setNewInstructor({ ...newInstructor, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
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
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Import Instructors</h3>
                            <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                                <p className="text-sm text-blue-800 mb-2 font-medium">Instructions:</p>
                                <p className="text-xs text-blue-600 mb-3">
                                    Upload an Excel file (.xlsx) with columns: Full Name, Email, Password, Role, Status.
                                </p>
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="flex items-center text-xs font-bold text-blue-700 hover:text-blue-900"
                                >
                                    <FaDownload className="mr-1" /> Download Template
                                </button>
                            </div>
                            <form onSubmit={handleImportInstructors} className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                                    <input
                                        type="file"
                                        onChange={e => setFile(e.target.files[0])}
                                        accept=".xlsx, .xls"
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">{file ? file.name : "Click to upload Excel file"}</span>
                                    </label>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowImportModal(false)}
                                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {isUploading ? 'Importing...' : 'Import'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetPasswordModal && instructorToReset && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-center p-6">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaKey className="text-yellow-600 text-xl" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Reset Password?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            This will reset the password for <strong>{instructorToReset.full_name}</strong> to the default "password".
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
            )}

            {/* Edit Modal (can follow similar pattern) */}
            {showEditModal && editingInstructor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Edit Instructor</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleUpdateInstructor} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    value={editingInstructor.full_name}
                                    onChange={(e) => setEditingInstructor({ ...editingInstructor, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={editingInstructor.email}
                                    onChange={(e) => setEditingInstructor({ ...editingInstructor, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    value={editingInstructor.role}
                                    onChange={(e) => setEditingInstructor({ ...editingInstructor, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="lecturer">Lecturer</option>
                                    <option value="invigilator">Invigilator</option>
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
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Instructors;