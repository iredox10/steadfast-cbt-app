import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { path } from '../../../utils/path';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaTimes,
    FaUserPlus,
    FaChalkboardTeacher,
    FaUsers,
    FaUpload,
    FaDownload
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
        password: '',
        role: 'lecturer',
        status: 'active',
        level_id: ''
    });
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

            console.log('Creating instructor with data:', instructorData); // Debug log

            const response = await axios.post(`${path}/add-user`, instructorData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Create instructor response:', response.data); // Debug log

            if (response.data.user) {
                setInstructors([...instructors, response.data.user]);
                setShowCreateModal(false);
                setNewInstructor({
                    full_name: '',
                    email: '',
                    password: '',
                    role: 'lecturer',
                    status: 'active',
                    level_id: ''
                });
                setSuccessMsg('Instructor created successfully');
                // Refresh the list
                fetchData();
            }
        } catch (error) {
            console.error('Error creating instructor:', error);
            console.error('Error response:', error.response?.data); // Debug log
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
        // Create template data with headers and sample row
        const templateData = [
            {
                'Full Name': 'Jane Smith',
                'Email': 'jane.smith@example.com',
                'Password': 'securePassword123',
                'Role': 'lecturer',
                'Status': 'active'
            }
        ];

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(templateData);

        // Set column widths
        ws['!cols'] = [
            { wch: 20 }, // Full Name
            { wch: 30 }, // Email
            { wch: 20 }, // Password
            { wch: 15 }, // Role
            { wch: 12 }  // Status
        ];

        // Add data validation for Role column (column D, starting from row 2)
        // Role options: lecturer, invigilator
        if (!ws['!dataValidation']) ws['!dataValidation'] = [];

        // Add dropdown validation for Role column (D2:D1000)
        ws['!dataValidation'].push({
            type: 'list',
            allowBlank: false,
            sqref: 'D2:D1000',
            formulas: ['"lecturer,invigilator"']
        });

        // Add dropdown validation for Status column (E2:E1000)
        ws['!dataValidation'].push({
            type: 'list',
            allowBlank: false,
            sqref: 'E2:E1000',
            formulas: ['"active,inactive"']
        });

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Instructors');

        // Generate and download file
        XLSX.writeFile(wb, 'instructor_import_template.xlsx');
    };

    const handleStatusChange = async (instructorId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${path}/update-instructor-status/${instructorId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state - map 'inactive' to 'not_active' for consistency with database
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

    const getRoleDisplay = (role) => {
        switch (role) {
            case 'lecturer':
                return 'Lecturer';
            case 'invigilator':
                return 'Invigilator';
            case 'instructor':
                return 'Instructor';
            default:
                return role;
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentInstructors = instructors.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(instructors.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <AdminSidebar userId={userId} />

            {/* Main Content */}
            <main className="flex-1 p-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Instructor Management</h2>
                        <p className="text-gray-600">Manage instructors and lecturers</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                            <FaUpload className="mr-2" />
                            Import Instructors
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            <FaPlus className="mr-2" />
                            Add Instructor
                        </button>
                    </div>
                </header>

                {/* Messages */}
                {errMsg && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {errMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {successMsg}
                    </div>
                )}

                {/* Instructors List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <FaChalkboardTeacher className="mr-2" />
                            Instructors ({instructors.length})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    {currentUser?.role === 'level_admin' && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentInstructors.map(instructor => (
                                    <tr key={instructor.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FaChalkboardTeacher className="text-blue-500 mr-3" />
                                                <span className="font-medium text-gray-900">{instructor.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{instructor.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {getRoleDisplay(instructor.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {instructor.level?.title || 'All Departments'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={instructor.status === 'not_active' ? 'inactive' : instructor.status}
                                                onChange={(e) => handleStatusChange(instructor.id, e.target.value)}
                                                className={`px-3 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 ${instructor.status === 'active'
                                                        ? 'bg-green-100 text-green-800 focus:ring-green-500'
                                                        : 'bg-red-100 text-red-800 focus:ring-red-500'
                                                    }`}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {new Date(instructor.created_at).toLocaleDateString()}
                                        </td>
                                        {currentUser?.role === 'level_admin' && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {instructor.role === 'lecturer' ? (
                                                    <Link
                                                        to={`/assign-courses/${instructor.id}`}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                                    >
                                                        <FaUserPlus className="mr-1" />
                                                        Assign Courses
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Not applicable</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {instructors.length === 0 && (
                                    <tr>
                                        <td colSpan={currentUser?.role === 'level_admin' ? "7" : "6"} className="px-6 py-8 text-center text-gray-500">
                                            <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <p>No instructors found</p>
                                            {currentUser?.role === 'level_admin' && (
                                                <p className="text-sm mt-2">Add instructors to your department</p>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {instructors.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, instructors.length)}</span> of <span className="font-medium">{instructors.length}</span> results
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                        }`}
                                >
                                    Previous
                                </button>

                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => paginate(i + 1)}
                                        className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === i + 1
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Create Instructor Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Add New Instructor</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Show department info for level admins */}
                            {currentUser?.role === 'level_admin' && currentUser?.level && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                                    <h4 className="font-semibold text-blue-800 mb-2">Instructor will be assigned to:</h4>
                                    <p className="text-blue-700"><strong>Department:</strong> {currentUser.level.title}</p>
                                </div>
                            )}

                            <form onSubmit={handleCreateInstructor} className="space-y-4">
                                {errMsg && (
                                    <div className="text-red-600 text-sm">
                                        {errMsg}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={newInstructor.full_name}
                                        onChange={(e) => setNewInstructor({ ...newInstructor, full_name: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={newInstructor.email}
                                        onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        value={newInstructor.password}
                                        onChange={(e) => setNewInstructor({ ...newInstructor, password: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <select
                                        value={newInstructor.role}
                                        onChange={(e) => setNewInstructor({ ...newInstructor, role: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="lecturer">Lecturer</option>
                                        <option value="invigilator">Invigilator</option>
                                    </select>
                                </div>

                                {/* Only show department selection for super admins */}
                                {currentUser?.role !== 'level_admin' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Department</label>
                                        <select
                                            value={newInstructor.level_id}
                                            onChange={(e) => setNewInstructor({ ...newInstructor, level_id: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map((department) => (
                                                <option key={department.id} value={department.id}>
                                                    {department.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        value={newInstructor.status}
                                        onChange={(e) => setNewInstructor({ ...newInstructor, status: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition duration-200"
                                    >
                                        {loading ? 'Creating...' : 'Create Instructor'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Instructors Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Import Instructors</h3>
                            <button onClick={() => setShowImportModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleImportInstructors} className="space-y-4">
                            {errMsg && <p className="text-red-500">{errMsg}</p>}

                            {/* Download Template Button */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-gray-700 mb-3">
                                    <strong>First time importing?</strong> Download the template to see the required format.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleDownloadTemplate}
                                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full justify-center"
                                >
                                    <FaDownload className="mr-2" />
                                    Download Excel Template
                                </button>
                            </div>

                            {/* File Upload */}
                            <div className="p-4 border-2 border-dashed rounded-lg text-center">
                                <input
                                    type="file"
                                    onChange={e => setFile(e.target.files[0])}
                                    accept=".xlsx, .xls"
                                    className="hidden"
                                    id="instructor-file-upload"
                                />
                                <label htmlFor="instructor-file-upload" className="cursor-pointer text-blue-500">
                                    {file ? file.name : "Choose an Excel file"}
                                </label>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowImportModal(false)}
                                    className="px-4 py-2 bg-gray-200 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-green-300"
                                >
                                    {isUploading ? "Uploading..." : "Import"}
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
