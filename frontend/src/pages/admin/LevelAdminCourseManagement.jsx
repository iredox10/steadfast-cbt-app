import React, { useState, useEffect } from 'react';
import { FaBook, FaPlus, FaUserTie, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaTimes } from 'react-icons/fa';
import AdminSidebar from '../../components/AdminSidebar';
import axios from 'axios';
import { path } from '../../../utils/path';

const LevelAdminCourseManagement = () => {
    const [activeSession, setActiveSession] = useState(null);
    const [courses, setCourses] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states
    const [showAddCourseModal, setShowAddCourseModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const [courseForm, setCourseForm] = useState({
        code: '',
        title: '',
        credit_unit: '',
        semester_id: ''
    });

    const [assignForm, setAssignForm] = useState({
        lecturer_id: ''
    });

    useEffect(() => {
        fetchActiveSessionData();
        fetchLecturers();
    }, []);

    const fetchActiveSessionData = async () => {
        try {
            const token = localStorage.getItem('token');
            // Only fetch the global active session and its courses
            const response = await axios.get(`${path}/get-active-session-courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActiveSession(response.data.session);
            setCourses(response.data.courses);
            // Only fetch semesters for the active session
            if (response.data.session) {
                const semesterResponse = await axios.get(`${path}/get-semesters/${response.data.session.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSemesters(semesterResponse.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'No active global session set');
        } finally {
            setLoading(false);
        }
    };

    const fetchLecturers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${path}/users-by-level`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLecturers(response.data.filter(user => user.role === 'lecturer'));
        } catch (err) {
            console.error('Failed to fetch lecturers:', err);
        }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${path}/add-course-to-session`, courseForm, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Course added successfully!');
            setShowAddCourseModal(false);
            setCourseForm({ code: '', title: '', credit_unit: '', semester_id: '' });
            fetchActiveSessionData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add course');
        }
    };

    const handleAssignCourse = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${path}/assign-course-to-lecturer`, {
                course_id: selectedCourse.id,
                lecturer_id: assignForm.lecturer_id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Course assigned to lecturer successfully!');
            setShowAssignModal(false);
            setAssignForm({ lecturer_id: '' });
            setSelectedCourse(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to assign course');
        }
    };

    const handleImportCourses = async (e) => {
        e.preventDefault();
        if (!importFile) {
            setError('Please select a file to import');
            return;
        }

        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('session_id', activeSession?.id);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${path}/import-courses`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Courses imported successfully!');
            setShowImportModal(false);
            setImportFile(null);
            fetchActiveSessionData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to import courses');
        }
    };

    const handleDownloadSample = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${path}/download-sample-course-import`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'sample_courses_import.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading sample file:', error);
            setError('Failed to download sample file');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <FaBook className="text-blue-600 text-2xl" />
                        <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
                    </div>
                    <p className="text-gray-600">
                        Add courses to the <span className="font-semibold text-green-700">active academic session</span> and assign them to lecturers in your level. Only the session activated by the Super Admin is shown below.
                    </p>
                </div>

                {/* Only show the active session set by Super Admin */}
                {activeSession ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <FaCalendarAlt className="text-green-600 text-xl" />
                            <h2 className="text-xl font-semibold text-green-800">Active Academic Session</h2>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                            <h3 className="text-lg font-semibold text-gray-900">{activeSession.title}</h3>
                            {activeSession.description && (
                                <p className="text-gray-600 mt-1">{activeSession.description}</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <FaExclamationTriangle className="text-yellow-600 text-xl" />
                            <h2 className="text-lg font-semibold text-yellow-800">No Active Session</h2>
                        </div>
                        <p className="text-yellow-700">
                            No global academic session is currently active. Please contact the super administrator to set an active session before adding courses.
                        </p>
                    </div>
                )}

                {/* Alerts */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2">
                            <FaExclamationTriangle className="text-red-600" />
                            <span className="text-red-800">{error}</span>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-green-600" />
                            <span className="text-green-800">{success}</span>
                        </div>
                    </div>
                )}

                {/* Courses Section */}
                {activeSession && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Session Courses</h2>
                                    <p className="text-gray-600 mt-1">Courses in {activeSession.title}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowImportModal(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <FaPlus />
                                        Import Courses
                                    </button>
                                    <button
                                        onClick={() => setShowAddCourseModal(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <FaPlus />
                                        Add Course
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            {courses.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaBook className="text-gray-300 text-5xl mb-4 mx-auto" />
                                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Courses Added</h3>
                                    <p className="text-gray-600 mb-6">Add your first course to the active session.</p>
                                    <button
                                        onClick={() => setShowAddCourseModal(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                    >
                                        Add First Course
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {courses.map((course) => (
                                        <div key={course.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 text-lg">{course.title}</h3>
                                                    <p className="text-gray-600 text-sm mt-1">{course.code}</p>
                                                    <p className="text-gray-500 text-sm">
                                                        {course.credit_unit} Credit Unit{course.credit_unit > 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    {course.semester?.title || 'No Semester'}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCourse(course);
                                                        setShowAssignModal(true);
                                                    }}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                                                >
                                                    <FaUserTie className="text-xs" />
                                                    Assign
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Add Course Modal */}
                {showAddCourseModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Add New Course</h3>
                                <button
                                    onClick={() => setShowAddCourseModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleAddCourse} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Course Code
                                    </label>
                                    <input
                                        type="text"
                                        value={courseForm.code}
                                        onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Course Title
                                    </label>
                                    <input
                                        type="text"
                                        value={courseForm.title}
                                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Credit Units
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={courseForm.credit_unit}
                                        onChange={(e) => setCourseForm({ ...courseForm, credit_unit: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Semester
                                    </label>
                                    <select
                                        value={courseForm.semester_id}
                                        onChange={(e) => setCourseForm({ ...courseForm, semester_id: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Semester</option>
                                        {semesters.map(semester => (
                                            <option key={semester.id} value={semester.id}>
                                                {semester.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddCourseModal(false)}
                                        className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Add Course
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Assign Course Modal */}
                {showAssignModal && selectedCourse && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Assign Course to Lecturer</h3>
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900">{selectedCourse.title}</h4>
                                <p className="text-sm text-gray-600">{selectedCourse.code}</p>
                            </div>

                            <form onSubmit={handleAssignCourse} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Lecturer
                                    </label>
                                    <select
                                        value={assignForm.lecturer_id}
                                        onChange={(e) => setAssignForm({ ...assignForm, lecturer_id: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Choose a lecturer</option>
                                        {lecturers.map(lecturer => (
                                            <option key={lecturer.id} value={lecturer.id}>
                                                {lecturer.full_name} ({lecturer.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAssignModal(false)}
                                        className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                                    >
                                        Assign Course
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Import Courses Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Import Courses</h3>
                                <button
                                    onClick={() => setShowImportModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 mb-4">
                                Upload an Excel or CSV file with columns: Code, Title, Credit Unit, Semester.
                                <button
                                    onClick={handleDownloadSample}
                                    className="text-blue-600 hover:text-blue-800 ml-2 underline"
                                    type="button"
                                >
                                    Download Sample File
                                </button>
                            </p>

                            <form onSubmit={handleImportCourses} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select File
                                    </label>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={(e) => setImportFile(e.target.files[0])}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowImportModal(false)}
                                        className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                                    >
                                        Import
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LevelAdminCourseManagement;
