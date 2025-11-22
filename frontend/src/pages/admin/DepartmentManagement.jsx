import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { path } from '../../../utils/path';
import AdminSidebar from '../../components/AdminSidebar';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPhone, FaEnvelope, FaSearch } from 'react-icons/fa';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        head_of_department: '',
        contact_email: '',
        contact_phone: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    
    // Pagination and Search State
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${path}/departments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setDepartments(response.data || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
            setError('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const url = editingDepartment 
                ? `${path}/departments/${editingDepartment.id}`
                : `${path}/departments`;
            
            const method = editingDepartment ? 'put' : 'post';
            
            const response = await axios[method](url, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setMessage(response.data.message || (editingDepartment ? 'Department updated successfully!' : 'Department created successfully!'));
            setError('');
            resetForm();
            fetchDepartments();
        } catch (error) {
            console.error('Error saving department:', error);
            setError(error.response?.data?.error || 'Failed to save department');
            setMessage('');
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (department) => {
        setEditingDepartment(department);
        setFormData({
            title: department.title || '',
            description: department.description || '',
            head_of_department: department.head_of_department || '',
            contact_email: department.contact_email || '',
            contact_phone: department.contact_phone || ''
        });
        setShowAddForm(true);
        setError('');
        setMessage('');
    };

    const handleDelete = async (departmentId) => {
        if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${path}/departments/${departmentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            setMessage(response.data.message || 'Department deleted successfully!');
            setError('');
            fetchDepartments();
        } catch (error) {
            console.error('Error deleting department:', error);
            setError(error.response?.data?.error || 'Failed to delete department');
            setMessage('');
        }
    };

    const handleToggleStatus = async (departmentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${path}/departments/${departmentId}/toggle-status`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            setMessage(response.data.message || 'Department status updated successfully!');
            setError('');
            fetchDepartments();
        } catch (error) {
            console.error('Error toggling status:', error);
            setError(error.response?.data?.error || 'Failed to update department status');
            setMessage('');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            head_of_department: '',
            contact_email: '',
            contact_phone: ''
        });
        setShowAddForm(false);
        setEditingDepartment(null);
        setError('');
        setMessage('');
    };

    // Filter departments based on search term
    const filteredDepartments = departments.filter(dept => 
        dept.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.head_of_department && dept.head_of_department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDepartments = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="flex">
                <AdminSidebar />
                <div className="flex-1 p-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex">
            <AdminSidebar />
            <div className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <FaBuilding className="text-3xl text-orange-500 mr-3" />
                            <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                        >
                            <FaPlus className="w-4 h-4" />
                            <span>Add Department</span>
                        </button>
                    </div>

                    {/* Messages */}
                    {message && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {typeof error === 'object' ? error.error || error.message || 'An error occurred' : error}
                        </div>
                    )}

                    {/* Add/Edit Department Form */}
                    {showAddForm && (
                        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {editingDepartment ? 'Edit Department' : 'Add New Department'}
                                </h2>
                                <button
                                    onClick={resetForm}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Department Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            required
                                            placeholder="e.g., Computer Science"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Head of Department
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.head_of_department}
                                            onChange={(e) => setFormData({...formData, head_of_department: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="e.g., Dr. John Smith"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        rows="3"
                                        placeholder="Brief description of the department..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Contact Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.contact_email}
                                            onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="department@school.edu"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Contact Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.contact_phone}
                                            onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="+234-xxx-xxx-xxxx"
                                        />
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {formLoading && (
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        <span>{editingDepartment ? 'Update Department' : 'Create Department'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Departments List */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
                            <h2 className="text-lg font-semibold text-gray-900">All Departments ({filteredDepartments.length})</h2>
                            
                            {/* Search Bar */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search departments..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1); // Reset to first page on search
                                    }}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-64"
                                />
                            </div>
                        </div>
                        
                        {filteredDepartments.length === 0 ? (
                            <div className="text-center py-12">
                                <FaBuilding className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm ? `No matches for "${searchTerm}"` : "Get started by creating your first department."}
                                </p>
                                {!searchTerm && (
                                    <div className="mt-6">
                                        <button
                                            onClick={() => setShowAddForm(true)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                                        >
                                            <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                                            Add Department
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Department
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Head of Department
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Contact Information
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {currentDepartments.map((department) => (
                                                <tr key={department.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <FaBuilding className="text-orange-500 mr-3" />
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {department.title}
                                                                </div>
                                                                {department.description && (
                                                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                                                        {department.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {department.head_of_department || (
                                                            <span className="text-gray-400 italic">Not assigned</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="space-y-1">
                                                            {department.contact_email && (
                                                                <div className="flex items-center">
                                                                    <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                                                                    {department.contact_email}
                                                                </div>
                                                            )}
                                                            {department.contact_phone && (
                                                                <div className="flex items-center">
                                                                    <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                                                                    {department.contact_phone}
                                                                </div>
                                                            )}
                                                            {!department.contact_email && !department.contact_phone && (
                                                                <span className="text-gray-400 italic">No contact info</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleToggleStatus(department.id)}
                                                            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                                                                department.status === 'active' 
                                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                            }`}
                                                        >
                                                            {department.status === 'active' ? <FaToggleOn className="mr-1" /> : <FaToggleOff className="mr-1" />}
                                                            {department.status === 'active' ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEdit(department)}
                                                                className="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
                                                            >
                                                                <FaEdit className="mr-1" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(department.id)}
                                                                className="text-red-600 hover:text-red-900 transition-colors flex items-center"
                                                            >
                                                                <FaTrash className="mr-1" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                {filteredDepartments.length > itemsPerPage && (
                                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredDepartments.length)}</span> of <span className="font-medium">{filteredDepartments.length}</span> results
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => paginate(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className={`px-3 py-1 rounded-md text-sm font-medium ${
                                                    currentPage === 1
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
                                                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                                                        currentPage === i + 1
                                                            ? 'bg-orange-600 text-white'
                                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                                    }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => paginate(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className={`px-3 py-1 rounded-md text-sm font-medium ${
                                                    currentPage === totalPages
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                                }`}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentManagement;
