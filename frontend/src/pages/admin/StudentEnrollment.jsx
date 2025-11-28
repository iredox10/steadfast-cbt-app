import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { path } from '../../../utils/path';
import {
    FaUserGraduate,
    FaBook,
    FaCheck,
    FaTimes,
    FaSearch,
    FaArrowLeft,
    FaUsers,
    FaPlus,
    FaTrash,
    FaSync,
    FaCheckCircle,
    FaExclamationCircle,
    FaInfoCircle
} from 'react-icons/fa';
import Sidebar from '../../components/AdminSidebar';
import Header from '../../components/Header';

const StudentEnrollment = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [unenrolledStudents, setUnenrolledStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchEnrolled, setSearchEnrolled] = useState('');
    const [searchUnenrolled, setSearchUnenrolled] = useState('');
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [message, setMessage] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState('');
    const [levels, setLevels] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    // Pagination State
    const [pageAvailable, setPageAvailable] = useState(1);
    const [itemsPerAvailablePage] = useState(10);
    const [pageEnrolled, setPageEnrolled] = useState(1);
    const [itemsPerEnrolledPage] = useState(10);

    useEffect(() => {
        fetchCurrentUser();
        fetchData();
        fetchLevels();
    }, [courseId]);

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const userRes = await axios.get(`${path}/user`, { headers });
            setCurrentUser(userRes.data);
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const fetchLevels = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`${path}/get-acd-sessions`, { headers });
            setLevels(response.data || []);
        } catch (error) {
            console.error('Error fetching levels:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Fetch course details
            const courseRes = await axios.get(`${path}/get-course/${courseId}`, { headers });
            setCourse(courseRes.data);

            // Fetch enrolled students
            const enrolledRes = await axios.get(`${path}/get-course-students/${courseId}`, { headers });
            setEnrolledStudents(enrolledRes.data || []);

            // Fetch unenrolled students
            const unenrolledRes = await axios.get(`${path}/unenrolled-students/${courseId}`, { headers });
            setUnenrolledStudents(unenrolledRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            showMessage('Error loading data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleSelectStudent = (studentId) => {
        setSelectedStudents(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId);
            } else {
                return [...prev, studentId];
            }
        });
    };

    const handleSelectAll = () => {
        const filteredIds = filteredUnenrolledStudents.map(s => s.id);
        if (selectedStudents.length === filteredIds.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredIds);
        }
    };

    const handleEnrollSelected = async () => {
        if (selectedStudents.length === 0) {
            showMessage('Please select at least one student', 'error');
            return;
        }

        setEnrolling(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.post(`${path}/enroll-students`, {
                course_id: courseId,
                student_ids: selectedStudents
            }, { headers });

            showMessage(
                `Successfully enrolled ${response.data.enrolled_count} student(s)`,
                'success'
            );

            // Reset selection and refresh data
            setSelectedStudents([]);
            await fetchData();
        } catch (error) {
            console.error('Error enrolling students:', error);
            showMessage(error.response?.data?.message || 'Failed to enroll students', 'error');
        } finally {
            setEnrolling(false);
        }
    };

    const handleEnrollByLevel = async () => {
        if (!selectedLevel) {
            showMessage('Please select a level/department', 'error');
            return;
        }

        setEnrolling(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.post(`${path}/enroll-students-by-level`, {
                course_id: courseId,
                level_id: selectedLevel
            }, { headers });

            showMessage(
                `Successfully enrolled ${response.data.enrolled_count} student(s) from the selected level`,
                'success'
            );

            setSelectedLevel('');
            await fetchData();
        } catch (error) {
            console.error('Error enrolling by level:', error);
            showMessage(error.response?.data?.message || 'Failed to enroll students by level', 'error');
        } finally {
            setEnrolling(false);
        }
    };

    const handleUnenroll = async (studentId) => {
        if (!window.confirm('Are you sure you want to unenroll this student?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.post(`${path}/unenroll-student`, {
                course_id: courseId,
                student_id: studentId
            }, { headers });

            showMessage('Student successfully unenrolled', 'success');
            await fetchData();
        } catch (error) {
            console.error('Error unenrolling student:', error);
            showMessage(error.response?.data?.message || 'Failed to unenroll student', 'error');
        }
    };

    // Filter enrolled students
    const filteredEnrolledStudents = enrolledStudents.filter(student =>
        student.full_name?.toLowerCase().includes(searchEnrolled.toLowerCase()) ||
        student.candidate_no?.toLowerCase().includes(searchEnrolled.toLowerCase()) ||
        student.department?.toLowerCase().includes(searchEnrolled.toLowerCase())
    );

    // Filter unenrolled students
    const filteredUnenrolledStudents = unenrolledStudents.filter(student =>
        student.full_name?.toLowerCase().includes(searchUnenrolled.toLowerCase()) ||
        student.candidate_no?.toLowerCase().includes(searchUnenrolled.toLowerCase()) ||
        student.department?.toLowerCase().includes(searchUnenrolled.toLowerCase())
    );

    // Pagination Logic
    const totalAvailablePages = Math.ceil(filteredUnenrolledStudents.length / itemsPerAvailablePage);
    const paginatedAvailableStudents = filteredUnenrolledStudents.slice(
        (pageAvailable - 1) * itemsPerAvailablePage,
        pageAvailable * itemsPerAvailablePage
    );

    const totalEnrolledPages = Math.ceil(filteredEnrolledStudents.length / itemsPerEnrolledPage);
    const paginatedEnrolledStudents = filteredEnrolledStudents.slice(
        (pageEnrolled - 1) * itemsPerEnrolledPage,
        pageEnrolled * itemsPerEnrolledPage
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading enrollment data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1">
                {/* Success/Error Message */}
                {message && (
                    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                        } text-white`}>
                        {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <FaArrowLeft /> Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FaBook className="text-blue-500" />
                        Student Enrollment
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {course?.course_name || 'Course'} - Manage student enrollments
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Enrolled Students</p>
                                <h3 className="text-3xl font-bold text-green-600">{enrolledStudents.length}</h3>
                            </div>
                            <div className="p-4 bg-green-100 rounded-full">
                                <FaCheckCircle className="text-green-500 text-2xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Available Students</p>
                                <h3 className="text-3xl font-bold text-blue-600">{unenrolledStudents.length}</h3>
                            </div>
                            <div className="p-4 bg-blue-100 rounded-full">
                                <FaUsers className="text-blue-500 text-2xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Selected to Enroll</p>
                                <h3 className="text-3xl font-bold text-purple-600">{selectedStudents.length}</h3>
                            </div>
                            <div className="p-4 bg-purple-100 rounded-full">
                                <FaPlus className="text-purple-500 text-2xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Enroll by Level - Only show for Super Admin */}
                {currentUser?.role !== 'level_admin' && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-lg">
                        <div className="flex items-start gap-3">
                            <FaInfoCircle className="text-blue-500 text-xl mt-1" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 mb-2">Quick Enroll by Level/Department</h3>
                                <p className="text-blue-700 text-sm mb-4">
                                    Enroll all students from a specific level/department at once
                                </p>
                                <div className="flex gap-3">
                                    <select
                                        value={selectedLevel}
                                        onChange={(e) => setSelectedLevel(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Level/Department</option>
                                        {levels.map(level => (
                                            <option key={level.id} value={level.id}>
                                                {level.session}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleEnrollByLevel}
                                        disabled={!selectedLevel || enrolling}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {enrolling ? (
                                            <>
                                                <FaSync className="animate-spin" />
                                                Enrolling...
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus />
                                                Enroll Level
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Available Students */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <FaUsers className="text-blue-500" />
                                    Available Students ({filteredUnenrolledStudents.length})
                                </h2>
                                {selectedStudents.length > 0 && (
                                    <button
                                        onClick={handleEnrollSelected}
                                        disabled={enrolling}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {enrolling ? (
                                            <>
                                                <FaSync className="animate-spin" />
                                                Enrolling...
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus />
                                                Enroll Selected ({selectedStudents.length})
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search available students..."
                                    value={searchUnenrolled}
                                    onChange={(e) => setSearchUnenrolled(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {filteredUnenrolledStudents.length > 0 && (
                                <button
                                    onClick={handleSelectAll}
                                    className="mt-3 text-sm text-blue-500 hover:text-blue-600 font-medium"
                                >
                                    {selectedStudents.length === filteredUnenrolledStudents.length ? 'Deselect All' : 'Select All'}
                                </button>
                            )}
                        </div>

                        <div className="overflow-y-auto max-h-[600px]">
                            {paginatedAvailableStudents.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <FaUsers className="mx-auto text-4xl mb-3 opacity-50" />
                                    <p>No available students found</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {paginatedAvailableStudents.map(student => (
                                        <div
                                            key={student.id}
                                            onClick={() => handleSelectStudent(student.id)}
                                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedStudents.includes(student.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStudents.includes(student.id)}
                                                        onChange={() => { }}
                                                        className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                                                    />
                                                    {student.image ? (
                                                        <img
                                                            src={`${path.replace('/api', '')}/${student.image}`}
                                                            alt={student.full_name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <FaUserGraduate className="text-blue-500" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{student.full_name}</p>
                                                        <p className="text-sm text-gray-500">{student.candidate_no}</p>
                                                        <p className="text-xs text-gray-400">{student.department}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Available Students Pagination */}
                        {totalAvailablePages > 1 && (
                            <div className="p-4 border-t border-gray-100 flex justify-between items-center">
                                <button
                                    onClick={() => setPageAvailable(p => Math.max(1, p - 1))}
                                    disabled={pageAvailable === 1}
                                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {pageAvailable} of {totalAvailablePages}
                                </span>
                                <button
                                    onClick={() => setPageAvailable(p => Math.min(totalAvailablePages, p + 1))}
                                    disabled={pageAvailable === totalAvailablePages}
                                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Enrolled Students */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <FaCheckCircle className="text-green-500" />
                                Enrolled Students ({filteredEnrolledStudents.length})
                            </h2>

                            {/* Search */}
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search enrolled students..."
                                    value={searchEnrolled}
                                    onChange={(e) => setSearchEnrolled(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[600px]">
                            {paginatedEnrolledStudents.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <FaCheckCircle className="mx-auto text-4xl mb-3 opacity-50" />
                                    <p>No enrolled students found</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {paginatedEnrolledStudents.map(student => (
                                        <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {student.image ? (
                                                        <img
                                                            src={`${path.replace('/api', '')}/${student.image}`}
                                                            alt={student.full_name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                            <FaUserGraduate className="text-green-500" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{student.full_name}</p>
                                                        <p className="text-sm text-gray-500">{student.candidate_no}</p>
                                                        <p className="text-xs text-gray-400">{student.department}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleUnenroll(student.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Unenroll student"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Enrolled Students Pagination */}
                        {totalEnrolledPages > 1 && (
                            <div className="p-4 border-t border-gray-100 flex justify-between items-center">
                                <button
                                    onClick={() => setPageEnrolled(p => Math.max(1, p - 1))}
                                    disabled={pageEnrolled === 1}
                                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {pageEnrolled} of {totalEnrolledPages}
                                </span>
                                <button
                                    onClick={() => setPageEnrolled(p => Math.min(totalEnrolledPages, p + 1))}
                                    disabled={pageEnrolled === totalEnrolledPages}
                                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default StudentEnrollment;
