import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaUserShield, FaBuilding, FaFileUpload, FaDownload, FaUpload, FaKey } from 'react-icons/fa';
import { path } from '../../../utils/path';
import AdminSidebar from '../../components/AdminSidebar';

const FacultyManagement = () => {
    const { userId } = useParams();
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFacultyModal, setShowFacultyModal] = useState(false);
    const [showOfficerModal, setShowOfficerModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [showOfficerEditModal, setShowOfficerEditModal] = useState(false);
    const [editingOfficer, setEditingOfficer] = useState(null);
    const [currentFaculty, setCurrentFaculty] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [facultyData, setFacultyData] = useState({ name: '', code: '', description: '' });
    const [officerData, setOfficerData] = useState({ full_name: '', email: '', password: 'password' });
    const [officerEditData, setOfficerEditData] = useState({ full_name: '', email: '', status: 'active' });

    const fetchFaculties = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${path}/faculties`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setFaculties(res.data);
        } catch (err) {
            setError('Failed to fetch faculties');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculties();
    }, []);

    const handleFacultySubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentFaculty) {
                await axios.put(`${path}/faculties/${currentFaculty.id}`, facultyData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setSuccess('Faculty updated successfully');
            } else {
                await axios.post(`${path}/faculties`, facultyData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setSuccess('Faculty created successfully');
            }
            setShowFacultyModal(false);
            setFacultyData({ name: '', code: '', description: '' });
            setCurrentFaculty(null);
            fetchFaculties();
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        }
    };

    const handleOfficerSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${path}/create-faculty-officer`, {
                ...officerData,
                faculty_id: currentFaculty.id
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Faculty officer created successfully');
            setShowOfficerModal(false);
            setOfficerData({ full_name: '', email: '', password: 'password' });
            fetchFaculties();
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        }
    };

    const handleOfficerUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${path}/update-admin/${editingOfficer.id}`, {
                ...officerEditData,
                role: 'faculty_officer',
                faculty_id: currentFaculty.id
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Officer updated successfully');
            setShowOfficerEditModal(false);
            fetchFaculties();
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        }
    };

    const handleResetPassword = async (officerId) => {
        if (!window.confirm('Are you sure you want to reset this officer\'s password to "password"?')) return;
        try {
            await axios.post(`${path}/reset-admin-password/${officerId}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Password reset successfully');
        } catch (err) {
            setError('Failed to reset password');
        }
    };

    const handleImportFaculties = async (e) => {
        e.preventDefault();
        if (!importFile) return;
        const formData = new FormData();
        formData.append('file', importFile);
        try {
            await axios.post(`${path}/import-faculties`, formData, {
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess('Faculties imported successfully');
            setShowImportModal(false);
            setImportFile(null);
            fetchFaculties();
        } catch (err) {
            setError('Import failed');
        }
    };

    const handleDownloadSample = async () => {
        try {
            const res = await axios.get(`${path}/download-sample-faculties-import`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'sample_faculties_import.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Failed to download sample');
        }
    };

    const deleteFaculty = async (id) => {
        if (!window.confirm('Are you sure you want to delete this faculty? This will remove all associations.')) return;
        try {
            await axios.delete(`${path}/faculties/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Faculty deleted');
            fetchFaculties();
        } catch (err) {
            setError('Failed to delete faculty');
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <AdminSidebar userId={userId} />

            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Faculty Management</h2>
                        <p className="text-gray-500">Manage university faculties and their designated officers.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
                        >
                            <FaFileUpload className="mr-2 text-green-600" /> Import
                        </button>
                        <button 
                            onClick={() => { setCurrentFaculty(null); setFacultyData({ name: '', code: '', description: '' }); setShowFacultyModal(true); }}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all"
                        >
                            <FaPlus className="mr-2" /> Add Faculty
                        </button>
                    </div>
                </header>

                {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
                {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{success}</div>}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {faculties.map((faculty) => {
                            const officer = faculty.users?.find(u => u.role === 'faculty_officer');
                            
                            return (
                            <div key={faculty.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                            <FaBuilding size={24} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => { setCurrentFaculty(faculty); setFacultyData({ name: faculty.name, code: faculty.code, description: faculty.description }); setShowFacultyModal(true); }}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                onClick={() => deleteFaculty(faculty.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{faculty.name}</h3>
                                    <p className="text-sm font-mono text-blue-600 mb-2">{faculty.code}</p>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{faculty.description || 'No description provided.'}</p>
                                    
                                    {officer && (
                                        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FaUserShield className="text-green-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Faculty Officer</p>
                                                    <p className="text-sm font-bold text-gray-800">{officer.full_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={() => { 
                                                        setCurrentFaculty(faculty);
                                                        setEditingOfficer(officer);
                                                        setOfficerEditData({ full_name: officer.full_name, email: officer.email, status: officer.status || 'active' });
                                                        setShowOfficerEditModal(true);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Edit Officer"
                                                >
                                                    <FaEdit size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleResetPassword(officer.id)}
                                                    className="p-1.5 text-gray-400 hover:text-yellow-600 transition-colors"
                                                    title="Reset Password"
                                                >
                                                    <FaKey size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="text-xs text-gray-500">
                                            <span className="font-bold text-gray-700">{faculty.departments_count}</span> Departments
                                        </div>
                                        {!officer && (
                                            <button 
                                                onClick={() => { setCurrentFaculty(faculty); setShowOfficerModal(true); }}
                                                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                <FaUserShield className="mr-1" /> Add Officer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </main>

            {/* Faculty Modal */}
            {showFacultyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-800 p-4 flex justify-between items-center">
                            <h3 className="text-white font-bold">{currentFaculty ? 'Edit Faculty' : 'New Faculty'}</h3>
                            <button onClick={() => setShowFacultyModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleFacultySubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Name</label>
                                <input 
                                    type="text" required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={facultyData.name}
                                    onChange={e => setFacultyData({...facultyData, name: e.target.value})}
                                    placeholder="e.g. Faculty of Science"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Code</label>
                                <input 
                                    type="text" required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={facultyData.code}
                                    onChange={e => setFacultyData({...facultyData, code: e.target.value})}
                                    placeholder="e.g. FASC"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea 
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows="3"
                                    value={facultyData.description}
                                    onChange={e => setFacultyData({...facultyData, description: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowFacultyModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Save Faculty</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Officer Modal */}
            {showOfficerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-800 p-4 flex justify-between items-center">
                            <h3 className="text-white font-bold">Add Officer to {currentFaculty.name}</h3>
                            <button onClick={() => setShowOfficerModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleOfficerSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input 
                                    type="text" required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={officerData.full_name}
                                    onChange={e => setOfficerData({...officerData, full_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input 
                                    type="email" required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={officerData.email}
                                    onChange={e => setOfficerData({...officerData, email: e.target.value})}
                                />
                            </div>
                            <p className="text-xs text-gray-500 italic">Default password will be 'password'. The officer can change it after login.</p>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowOfficerModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Create Officer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Faculty Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-800 p-4 flex justify-between items-center">
                            <h3 className="text-white font-bold">Import Faculties</h3>
                            <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                <p className="text-sm text-blue-800 mb-2 font-medium">Instructions:</p>
                                <p className="text-xs text-blue-600 mb-3">
                                    Upload an Excel/CSV file with columns: Name, Code, Description.
                                </p>
                                <button onClick={handleDownloadSample} className="flex items-center text-xs font-bold text-blue-700 hover:text-blue-900">
                                    <FaDownload className="mr-1" /> Download Template
                                </button>
                            </div>
                            <form onSubmit={handleImportFaculties} className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                                    <input 
                                        type="file" accept=".xlsx,.xls,.csv" required
                                        onChange={(e) => setImportFile(e.target.files[0])}
                                        className="hidden" id="faculty-import"
                                    />
                                    <label htmlFor="faculty-import" className="cursor-pointer">
                                        <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">{importFile ? importFile.name : "Click to upload file"}</span>
                                    </label>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowImportModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" disabled={!importFile} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400">Import</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Officer Edit Modal */}
            {showOfficerEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-800 p-4 flex justify-between items-center">
                            <h3 className="text-white font-bold">Edit Officer: {currentFaculty.name}</h3>
                            <button onClick={() => setShowOfficerEditModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleOfficerUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input 
                                    type="text" required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={officerEditData.full_name}
                                    onChange={e => setOfficerEditData({...officerEditData, full_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input 
                                    type="email" required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={officerEditData.email}
                                    onChange={e => setOfficerEditData({...officerEditData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select 
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={officerEditData.status}
                                    onChange={e => setOfficerEditData({...officerEditData, status: e.target.value})}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowOfficerEditModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Update Officer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyManagement;