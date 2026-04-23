import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import {
    FaCheck,
    FaExclamationTriangle,
    FaSearch,
    FaGraduationCap,
    FaSync,
    FaSignOutAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaUser,
    FaTimes,
    FaSearchPlus,
    FaBook,
    FaRegClock,
    FaCalendarAlt,
    FaMedal,
    FaCog,
    FaPowerOff
} from "react-icons/fa";
import axios from "axios";
import { path } from "../../utils/path";
import logo from "../../public/assets/buk.png";

const Invigilator = () => {
    const { id } = useParams();
    const { data: userData, loading: userLoading } = useFetch(`/get-invigilator/${id}`);

    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [checkingIn, setCheckingIn] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [error, setError] = useState(null);
    const [showTerminateModal, setShowTerminateModal] = useState(false);
    const [terminationReason, setTerminationReason] = useState('');
    const [terminating, setTerminating] = useState(false);
    const [terminateSuccess, setTerminateSuccess] = useState(false);
    const [terminateError, setTerminateError] = useState(null);
    const [pendingRequest, setPendingRequest] = useState(null);

    const fetchStudents = async () => {
        setLoadingStudents(true);
        setError(null);
        try {
            if (userData?.exam?.course_id) {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const res = await axios.get(`${path}/invigilator/students/${userData.exam.course_id}`, { headers });
                setStudents(res.data || []);
            } else {
                setError("No course ID found for the exam");
            }
        } catch (err) {
            console.log("Error fetching students:", err);
            setError(err.response?.data?.message || "Failed to load students. Please try again.");
        } finally {
            setLoadingStudents(false);
        }
    };

    useEffect(() => {
        if (userData && !userLoading) {
            fetchStudents();
            if (userData?.Invigilator?.role === 'technician' && userData?.exam?.id) {
                fetchPendingRequest();
            }
        }
    }, [userData, userLoading]);

    const fetchPendingRequest = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${path}/pending-termination-requests`, { headers });
            const examId = userData?.exam?.id;
            const found = res.data?.requests?.find(r => r.exam_id === examId);
            setPendingRequest(found || null);
        } catch (err) {
            console.error("Error fetching pending requests:", err);
        }
    };

    const handleCheckIn = async (student) => {
        setCheckingIn(student.id);

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Just mark student as checked in - don't generate ticket
            const response = await axios.post(`${path}/invigilator/checkin-student`, {
                student_id: student.id,
                course_id: userData.exam.course_id
            }, { headers });

            if (response.status === 200) {
                const checkinTime = response.data?.checkin_time || response.data?.student?.checkin_time || new Date().toISOString();

                setStudents(prevStudents =>
                    prevStudents.map(s =>
                        s.id === student.id
                            ? {
                                ...s,
                                is_checked_in: true,
                                checkin_time: checkinTime
                            }
                            : s
                    )
                );

                setShowSuccess(true);

                setTimeout(() => {
                    setShowSuccess(false);
                }, 3000);
            }
        } catch (err) {
            console.error("Check-in error:", err);
            console.error("Error response:", err.response);
            console.error("Error data:", err.response?.data);

            const errorMessage = err.response?.data?.error
                || err.response?.data?.message
                || err.message
                || "Failed to check in student. Please try again.";

            alert(`Check-in failed: ${errorMessage}`);
        } finally {
            setCheckingIn(null);
        }
    };

    const handleRequestTermination = async (e) => {
        e.preventDefault();
        setTerminating(true);
        setTerminateError(null);

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const examId = userData?.exam?.id;

            const res = await axios.post(
                `${path}/request-terminate-exam/${examId}`,
                { reason: terminationReason },
                { headers }
            );

            setTerminateSuccess(true);
            setTerminationReason('');

            setTimeout(() => {
                setShowTerminateModal(false);
                setTerminateSuccess(false);
                fetchPendingRequest();
            }, 2000);
        } catch (err) {
            console.error("Termination request error:", err);
            setTerminateError(err.response?.data?.error || "Failed to submit termination request.");
        } finally {
            setTerminating(false);
        }
    };

    // Filter students
    const filteredStudents = students.filter(student => {
        const matchesSearch = searchTerm === '' ||
            student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.candidate_no.toString().includes(searchTerm);

        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'pending' && !student.is_checked_in) ||
            (filterStatus === 'checked-in' && student.is_checked_in);

        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        // Sort: Pending students first, then by name
        const aChecked = a.is_checked_in;
        const bChecked = b.is_checked_in;

        if (!aChecked && bChecked) return -1;
        if (aChecked && !bChecked) return 1;
        return a.full_name.localeCompare(b.full_name);
    });

    const stats = {
        total: students.length,
        pending: students.filter(s => !s.is_checked_in).length,
        checkedIn: students.filter(s => s.is_checked_in).length
    };

    if (userLoading || loadingStudents) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700">Loading...</p>
                </div>
            </div>
        );
    }

    // Check for various "no exam" scenarios
    if (!userData ||
        userData === "no exam activated" ||
        !userData.exam ||
        !userData.exam.course_id ||
        userData.examAssigned === false) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="text-center bg-white p-12 rounded-xl shadow-lg max-w-lg">
                        <FaExclamationTriangle className="text-7xl text-yellow-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">No Exam Assigned</h2>
                        <p className="text-gray-600 text-lg mb-6">
                            You currently don't have an active exam assigned to you.
                            Please contact the administrator to assign an exam.
                        </p>

                        {/* Additional info box */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-left mb-6">
                            <p className="text-sm text-blue-800">
                                <strong>What to do:</strong><br />
                                • Contact your administrator or exam coordinator<br />
                                • Ensure your invigilator account is properly set up<br />
                                • Verify that an exam has been activated and assigned to you
                            </p>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FaSync className="mr-2" />
                                Refresh Page
                            </button>
                            <Link
                                to="/admin-login"
                                className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <FaSignOutAlt className="mr-2" />
                                Logout
                            </Link>
                        </div>
                    </div>

                    {/* Debug info (only in development) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-lg">
                            <p className="font-bold mb-2">Debug Info:</p>
                            <pre className="overflow-auto">{JSON.stringify({
                                userData: userData ? 'exists' : 'null',
                                userDataValue: userData === "no exam activated" ? "no exam activated" : typeof userData,
                                hasExam: !!userData?.exam,
                                hasCourseId: !!userData?.exam?.course_id,
                                examAssigned: userData?.examAssigned
                            }, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Photo Modal */}
            {showPhotoModal && selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowPhotoModal(false)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
                        {/* Close button */}
                        <button
                            onClick={() => setShowPhotoModal(false)}
                            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg z-10 transition-all"
                        >
                            <FaTimes className="text-2xl" />
                        </button>

                        {/* Student info header */}
                        <div className="bg-blue-600 text-white p-6">
                            <h2 className="text-3xl font-bold mb-2">{selectedPhoto.name}</h2>
                            <p className="text-xl">Student ID: <span className="font-mono font-bold">{selectedPhoto.id}</span></p>
                        </div>

                        {/* Full size photo */}
                        <div className="p-8 flex items-center justify-center bg-gray-50">
                            <img
                                src={`${path.replace('/api', '')}/${selectedPhoto.image}`}
                                alt={selectedPhoto.name}
                                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        {/* Instructions */}
                        <div className="bg-gray-100 p-4 text-center text-gray-600">
                            <p className="text-sm">Click anywhere outside the photo or press the X button to close</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Notification */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 animate-bounce">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3">
                        <FaCheckCircle className="text-2xl" />
                        <div>
                            <p className="font-bold">Student Checked In Successfully!</p>
                            <p className="text-sm">Student can now access the exam</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Termination Request Modal */}
            {showTerminateModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setShowTerminateModal(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-red-600 text-white p-6">
                            <h2 className="text-2xl font-bold flex items-center">
                                <FaPowerOff className="mr-3" />
                                Request Exam Termination
                            </h2>
                            <p className="text-red-100 mt-1 text-sm">This request will be sent to the department admin for approval</p>
                        </div>

                        <div className="p-6">
                            {pendingRequest ? (
                                <div className="text-center py-4">
                                    <FaRegClock className="text-6xl text-yellow-500 mx-auto mb-4 animate-pulse" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Pending Request Exists</h3>
                                    <p className="text-gray-600 mb-4">You already have a pending termination request for this exam.</p>
                                    <div className="bg-gray-50 rounded-lg p-4 text-left mb-4">
                                        <p className="text-sm text-gray-700 mb-2"><strong>Your reason:</strong> {pendingRequest.request_reason}</p>
                                        <p className="text-sm text-gray-500"><strong>Submitted:</strong> {new Date(pendingRequest.created_at).toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm text-gray-500">Please wait for the department admin to review your request.</p>
                                </div>
                            ) : terminateSuccess ? (
                                <div className="text-center py-6">
                                    <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Request Submitted</h3>
                                    <p className="text-gray-600">Your termination request has been sent to the department admin for approval.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                                        <div className="flex items-start">
                                            <FaExclamationTriangle className="text-yellow-500 text-xl mt-0.5 mr-3 flex-shrink-0" />
                                            <p className="text-yellow-800 text-sm">
                                                <strong>Note:</strong> You must provide a reason for the termination request. The department admin will review and approve or reject your request.
                                            </p>
                                        </div>
                                    </div>

                                    {terminateError && (
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                            <p className="text-red-800 text-sm">{terminateError}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleRequestTermination}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Reason for Termination <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={terminationReason}
                                                onChange={(e) => setTerminationReason(e.target.value)}
                                                rows={4}
                                                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-red-500 focus:outline-none resize-none"
                                                placeholder="Provide a detailed reason for terminating this exam..."
                                                required
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowTerminateModal(false)}
                                                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={terminating || !terminationReason.trim()}
                                                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                                            >
                                                {terminating ? (
                                                    <>
                                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaPowerOff className="mr-2" />
                                                        Submit Request
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img src={logo} alt="Logo" className="h-12 w-12" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {userData?.Invigilator?.role === 'technician' ? 'Technician Panel' : 'Invigilator Panel'}
                                </h1>
                                <p className="text-gray-600">
                                    Welcome, {userData?.Invigilator?.full_name}
                                </p>
                                {userData?.exam?.course && (
                                    <p className="text-sm text-blue-600 font-semibold mt-1">
                                        Managing: {userData.exam.course}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/manual/invigilator"
                                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <FaBook className="mr-2" />
                                Manual
                            </Link>
                            <Link
                                to={`/invigilator-settings/${id}`}
                                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FaCog className="mr-2" />
                                Settings
                            </Link>
                            {userData?.Invigilator?.role === 'technician' && (
                                pendingRequest ? (
                                    <div className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg border-2 border-yellow-400">
                                        <FaRegClock className="mr-2 animate-pulse" />
                                        <div>
                                            <span className="font-medium text-sm">Request Pending</span>
                                            <span className="text-xs ml-2">(Awaiting admin approval)</span>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setShowTerminateModal(true);
                                            setTerminateError(null);
                                            setTerminateSuccess(false);
                                            setTerminationReason('');
                                        }}
                                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <FaPowerOff className="mr-2" />
                                        Request Termination
                                    </button>
                                )
                            )}
                            <button
                                onClick={fetchStudents}
                                disabled={loadingStudents}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                <FaSync className={`mr-2 ${loadingStudents ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <Link
                                to="/admin-login"
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                <FaSignOutAlt className="mr-2" />
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Exam Information Card */}
                {userData?.exam && (
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-xl shadow-2xl mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold mb-4 flex items-center">
                                    <FaBook className="mr-3" />
                                    Current Exam Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
                                        <p className="text-blue-100 text-sm mb-1">Exam Type</p>
                                        <p className="text-xl font-bold capitalize">{userData.exam.exam_type || 'N/A'}</p>
                                    </div>
                                    <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
                                        <p className="text-blue-100 text-sm mb-1">Course</p>
                                        <p className="text-xl font-bold">{userData.exam.course || 'N/A'}</p>
                                    </div>
                                    <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
                                        <p className="text-blue-100 text-sm mb-1">Duration</p>
                                        <p className="text-xl font-bold flex items-center">
                                            <FaRegClock className="mr-2" />
                                            {userData.exam.exam_duration || 'N/A'} minutes
                                        </p>
                                    </div>
                                    <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
                                        <p className="text-blue-100 text-sm mb-1">Activated On</p>
                                        <p className="text-xl font-bold flex items-center">
                                            <FaCalendarAlt className="mr-2" />
                                            {userData.exam.activated_date
                                                ? new Date(userData.exam.activated_date).toLocaleString()
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
                                        <p className="text-blue-100 text-sm mb-1">Status</p>
                                        <p className="text-xl font-bold flex items-center">
                                            <FaCheckCircle className="mr-2" />
                                            Active
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded-lg">
                        <div className="flex items-start">
                            <FaExclamationTriangle className="text-red-500 text-2xl mt-1 mr-4" />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Students</h3>
                                <p className="text-red-800 mb-3">{error}</p>
                                <button
                                    onClick={() => {
                                        setError(null);
                                        fetchStudents();
                                    }}
                                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <FaSync className="mr-2" />
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Important Notice */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-lg">
                    <div className="flex items-start">
                        <FaCheckCircle className="text-blue-500 text-2xl mt-1 mr-4" />
                        <div>
                            <h3 className="text-lg font-bold text-blue-900 mb-2">Invigilator Responsibilities</h3>
                            <p className="text-blue-800 space-y-2">
                                Your primary role is to ensure the integrity of the examination process. This involves:
                                <ul className="list-disc list-inside ml-4 mt-2">
                                    <li><strong>Identity Confirmation:</strong> Physically verify each student's identity against their registration details.</li>
                                </ul>
                                Upon successful completion of this step and your approval, students will be officially checked in, enabling them to proceed with the exam.
                            </p>                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">Total Students</p>
                                <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <FaUser className="text-5xl text-blue-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">Pending Check-in</p>
                                <p className="text-4xl font-bold text-gray-900">{stats.pending}</p>
                            </div>
                            <FaTimesCircle className="text-5xl text-yellow-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">Checked In</p>
                                <p className="text-4xl font-bold text-gray-900">{stats.checkedIn}</p>
                            </div>
                            <FaCheckCircle className="text-5xl text-green-500 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                        >
                            <option value="all">All Students ({stats.total})</option>
                            <option value="pending">Pending Check-in ({stats.pending})</option>
                            <option value="checked-in">Checked In ({stats.checkedIn})</option>
                        </select>
                    </div>
                </div>

                {/* Students Grid */}
                {filteredStudents.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-md text-center">
                        <FaGraduationCap className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Students Found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterStatus !== 'all'
                                ? 'Try adjusting your search or filter'
                                : 'No students enrolled in this exam'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((student) => {
                            const isCheckedIn = Boolean(student.is_checked_in);
                            const isSubmitted = Boolean(student.is_submitted);
                            const isProcessing = checkingIn === student.id;

                            return (
                                <div
                                    key={student.id}
                                    className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${isSubmitted
                                        ? 'border-4 border-blue-500 opacity-80'
                                        : isCheckedIn
                                            ? 'border-4 border-green-400'
                                            : 'border-4 border-gray-200 hover:border-blue-400'
                                        }`}
                                >
                                    {/* Student Photo - Large and Prominent */}
                                    <div className="relative group cursor-pointer">
                                        {student.image ? (
                                            <img
                                                src={`${path.replace('/api', '')}/${student.image}`}
                                                alt={student.full_name}
                                                className="w-full h-64 object-cover cursor-pointer"
                                                onClick={() => {
                                                    setSelectedPhoto({ image: student.image, name: student.full_name, id: student.candidate_no });
                                                    setShowPhotoModal(true);
                                                }}
                                                onError={(e) => {
                                                    console.error('Image failed to load:', student.image);
                                                    console.error('Full path:', `${path.replace('/api', '')}/${student.image}`);
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-64 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                                <FaGraduationCap className="text-white text-8xl opacity-50" />
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute top-4 right-4 z-10">
                                            {isSubmitted ? (
                                                <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold flex items-center shadow-lg">
                                                    <FaCheckCircle className="mr-2" />
                                                    SUBMITTED
                                                </div>
                                            ) : isCheckedIn ? (
                                                <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold flex items-center shadow-lg">
                                                    <FaCheckCircle className="mr-2" />
                                                    CHECKED IN
                                                </div>
                                            ) : (
                                                <div className="bg-yellow-500 text-white px-4 py-2 rounded-full font-bold flex items-center shadow-lg">
                                                    <FaTimesCircle className="mr-2" />
                                                    PENDING
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Student Information */}
                                    <div className="p-6">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{student.full_name}</h3>

                                        <div className="space-y-2 mb-4 text-gray-700">
                                            <div className="flex justify-between">
                                                <span className="font-semibold">Student ID:</span>
                                                <span className="font-mono">{student.candidate_no}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-semibold">Department:</span>
                                                <span className="text-right">{student.department}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-semibold">Programme:</span>
                                                <span className="text-right">{student.programme}</span>
                                            </div>



                                            {isCheckedIn && (
                                                <>
                                                    <div className="pt-2 border-t-2 border-gray-200 mt-3"></div>
                                                    {student.checkin_time && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="font-semibold">Check-in Time:</span>
                                                            <span>{new Date(student.checkin_time).toLocaleTimeString()}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        {!isCheckedIn && !isSubmitted && (
                                            <button
                                                onClick={() => handleCheckIn(student)}
                                                disabled={isProcessing}
                                                className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${isProcessing
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                                                    } text-white shadow-lg`}
                                            >
                                                {isProcessing ? (
                                                    <span className="flex items-center justify-center">
                                                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Checking In...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center">
                                                        <FaCheckCircle className="mr-2" />
                                                        Check In Student
                                                    </span>
                                                )}
                                            </button>
                                        )}

                                        {isCheckedIn && !isSubmitted && (
                                            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                                                <p className="text-green-800 font-bold flex items-center justify-center">
                                                    <FaCheckCircle className="mr-2" />
                                                    Ready for Exam
                                                </p>
                                            </div>
                                        )}

                                        {isSubmitted && (
                                            <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 text-center">
                                                <p className="text-blue-800 font-bold flex items-center justify-center">
                                                    <FaCheckCircle className="mr-2" />
                                                    Exam Finished
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Invigilator;
