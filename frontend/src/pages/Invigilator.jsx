import React, { useEffect, useState, useRef } from "react";
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
    FaBook,
    FaRegClock,
    FaCog,
    FaPowerOff,
    FaPlay,
    FaInfoCircle,
    FaUserCheck,
    FaUsers,
    FaHourglassHalf
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
    const [showStartModal, setShowStartModal] = useState(false);
    const [startingExam, setStartingExam] = useState(false);
    const [startSuccess, setStartSuccess] = useState(false);
    const [startError, setStartError] = useState(null);
    const [examCountdown, setExamCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [submittedCount, setSubmittedCount] = useState(0);
    const [liveExamData, setLiveExamData] = useState(null);
    const countdownIntervalRef = useRef(null);

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

    useEffect(() => {
        const exam = liveExamData || userData?.exam;
        if (!exam) return;

        const timerMode = exam.timer_mode;
        const timerStartType = exam.timer_start_type;
        const scheduledStartTime = exam.scheduled_start_time;
        const activatedDate = exam.activated_date;
        const duration = parseInt(exam.exam_duration) || 0;

        let startTime = null;

        if (timerMode === 'global') {
            if (timerStartType === 'manual' && activatedDate) {
                startTime = new Date(activatedDate).getTime();
            } else if (timerStartType === 'scheduled' && scheduledStartTime) {
                startTime = new Date(scheduledStartTime).getTime();
            }
        }

        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }

        if (!startTime) {
            setExamCountdown({ hours: 0, minutes: 0, seconds: 0 });
            return;
        }

        const updateCountdown = () => {
            const now = Date.now();
            const endTime = startTime + (duration * 60 * 1000);
            const remaining = endTime - now;

            if (remaining <= 0) {
                setExamCountdown({ hours: 0, minutes: 0, seconds: 0 });
                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                }
            } else {
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                setExamCountdown({ hours, minutes, seconds });
            }
        };

        updateCountdown();
        countdownIntervalRef.current = setInterval(updateCountdown, 1000);

        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
        };
    }, [liveExamData?.activated_date, liveExamData?.exam_duration, liveExamData?.timer_mode, liveExamData?.timer_start_type, liveExamData?.scheduled_start_time, userData?.exam?.activated_date, userData?.exam?.exam_duration, userData?.exam?.timer_mode, userData?.exam?.timer_start_type, userData?.exam?.scheduled_start_time]);

    useEffect(() => {
        if (students.length > 0) {
            const submitted = students.filter(s => s.is_submitted).length;
            setSubmittedCount(submitted);
        }
    }, [students]);

    useEffect(() => {
        if (!id) return;

        const interval = setInterval(async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await axios.get(`${path}/get-invigilator/${id}`, { headers });
                if (res.data?.exam) {
                    setLiveExamData(res.data.exam);
                    setStudents(prev => {
                        const updated = [...prev];
                        if (res.data.students) {
                            res.data.students.forEach(s => {
                                const idx = updated.findIndex(u => u.id === s.id);
                                if (idx !== -1) {
                                    updated[idx] = { ...updated[idx], is_submitted: s.is_submitted };
                                }
                            });
                        }
                        return updated;
                    });
                }
                if (userData?.Invigilator?.role === 'technician' && userData?.exam?.id) {
                    const reqRes = await axios.get(`${path}/pending-termination-requests`, { headers });
                    const examId = userData.exam.id;
                    const found = reqRes.data?.requests?.find(r => r.exam_id === examId);
                    setPendingRequest(found || null);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [id, userData?.Invigilator?.role, userData?.exam?.id]);

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

    const handleStartExam = async () => {
        setStartingExam(true);
        setStartError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const courseId = userData?.exam?.course_id;
            const res = await axios.post(`${path}/invigilator/start-exam/${courseId}`, {}, { headers });
            setStartSuccess(true);
            setTimeout(() => {
                setShowStartModal(false);
                setStartSuccess(false);
                window.location.reload();
            }, 2000);
        } catch (err) {
            console.error("Error starting exam:", err);
            setStartError(err.response?.data?.error || "Failed to start exam.");
        } finally {
            setStartingExam(false);
        }
    };

    const handleCheckIn = async (student) => {
        setCheckingIn(student.id);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.post(`${path}/invigilator/checkin-student`, {
                student_id: student.id,
                course_id: userData.exam.course_id
            }, { headers });

            if (response.status === 200) {
                const checkinTime = response.data?.checkin_time || response.data?.student?.checkin_time || new Date().toISOString();
                setStudents(prevStudents =>
                    prevStudents.map(s =>
                        s.id === student.id ? { ...s, is_checked_in: true, checkin_time: checkinTime } : s
                    )
                );
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Check-in error:", err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to check in student.";
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
            const res = await axios.post(`${path}/request-terminate-exam/${examId}`, { reason: terminationReason }, { headers });
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

    const filteredStudents = students.filter(student => {
        const matchesSearch = searchTerm === '' ||
            student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.candidate_no.toString().includes(searchTerm);
        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'pending' && !student.is_checked_in && !student.is_submitted) ||
            (filterStatus === 'checked-in' && student.is_checked_in && !student.is_submitted) ||
            (filterStatus === 'submitted' && student.is_submitted);
        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        if (a.is_submitted && !b.is_submitted) return 1;
        if (!a.is_submitted && b.is_submitted) return -1;
        if (!a.is_checked_in && b.is_checked_in) return -1;
        if (a.is_checked_in && !b.is_checked_in) return 1;
        return a.full_name.localeCompare(b.full_name);
    });

    const stats = {
        total: students.length,
        pending: students.filter(s => !s.is_checked_in && !s.is_submitted).length,
        checkedIn: students.filter(s => s.is_checked_in && !s.is_submitted).length,
        submitted: students.filter(s => s.is_submitted).length
    };

    if (userLoading || loadingStudents) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-gray-700">Loading...</p>
                </div>
            </div>
        );
    }

    if (!userData || userData === "no exam activated" || !userData.exam || !userData.exam.course_id || userData.examAssigned === false) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
                    <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Exam Assigned</h2>
                    <p className="text-gray-600 mb-4">You currently don't have an active exam assigned.</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Photo Modal */}
            {showPhotoModal && selectedPhoto && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setShowPhotoModal(false)}>
                    <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
                        <button onClick={() => setShowPhotoModal(false)} className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg z-10">
                            <FaTimes className="text-xl" />
                        </button>
                        <div className="bg-blue-600 text-white p-4">
                            <h2 className="text-xl font-bold">{selectedPhoto.name}</h2>
                            <p className="text-sm">ID: {selectedPhoto.id}</p>
                        </div>
                        <div className="p-6 flex items-center justify-center bg-gray-50">
                            <img src={`${path.replace('/api', '')}/${selectedPhoto.image}`} alt={selectedPhoto.name} className="max-w-full max-h-[60vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
                        </div>
                    </div>
                </div>
            )}

            {/* Success Notification */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
                        <FaCheckCircle />
                        <p className="font-medium text-sm">Student Checked In!</p>
                    </div>
                </div>
            )}

            {/* Termination Request Modal */}
            {showTerminateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowTerminateModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold">Request Termination</h2>
                            <button onClick={() => setShowTerminateModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <div className="p-4">
                            {pendingRequest ? (
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
                                        <FaRegClock className="text-3xl text-yellow-600 animate-pulse" />
                                    </div>
                                    <p className="font-bold text-gray-900">Termination Request Pending</p>
                                    <p className="text-sm text-gray-500 mt-2">Awaiting admin approval</p>
                                    <div className="bg-gray-50 rounded-lg p-3 mt-3 text-left">
                                        <p className="text-xs text-gray-500 mb-1">Your reason:</p>
                                        <p className="text-sm text-gray-800">{pendingRequest.request_reason}</p>
                                        <p className="text-xs text-gray-400 mt-2">Submitted: {new Date(pendingRequest.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            ) : terminateSuccess ? (
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                                        <FaCheckCircle className="text-3xl text-green-600" />
                                    </div>
                                    <p className="font-bold text-gray-900">Request Submitted</p>
                                    <p className="text-sm text-gray-500 mt-1">Admin will review your request</p>
                                </div>
                            ) : (
                                <form onSubmit={handleRequestTermination}>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 text-sm">
                                        <FaInfoCircle className="inline mr-1 text-yellow-600" /> Admin must approve before exam can be terminated.
                                    </div>
                                    <textarea value={terminationReason} onChange={(e) => setTerminationReason(e.target.value)} rows={3} className="w-full border rounded-lg p-2 text-sm mb-3" placeholder="Reason for termination..." required />
                                    {terminateError && <p className="text-red-500 text-sm mb-3">{terminateError}</p>}
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setShowTerminateModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg text-sm">Cancel</button>
                                        <button type="submit" disabled={terminating} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50">
                                            {terminating ? 'Submitting...' : 'Submit Request'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Start Exam Modal */}
            {showStartModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowStartModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold">Start Exam Timer</h2>
                            <button onClick={() => setShowStartModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <div className="p-4">
                            {startSuccess ? (
                                <div className="text-center py-4">
                                    <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-3" />
                                    <p className="font-medium">Timer Started!</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-sm">
                                        <FaInfoCircle className="inline mr-1" /> Timer cannot be paused or reset once started.
                                    </div>
                                    {startError && <p className="text-red-500 text-sm mb-3">{startError}</p>}
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowStartModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg text-sm">Cancel</button>
                                        <button onClick={handleStartExam} disabled={startingExam} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50">
                                            {startingExam ? 'Starting...' : 'Start Now'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Top Bar */}
            <header className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img src={logo} alt="Logo" className="h-8 w-8" />
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">
                                    {userData?.Invigilator?.role === 'technician' ? 'Technician Panel' : 'Invigilator Panel'}
                                </h1>
                                <p className="text-xs text-gray-500">{userData?.exam?.course || 'No exam'}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Link to="/manual/invigilator" className="flex items-center px-2 py-1.5 text-gray-600 hover:text-gray-900 text-sm">
                                <FaBook className="mr-1 text-xs" /> Manual
                            </Link>
                            <Link to={`/invigilator-settings/${id}`} className="flex items-center px-2 py-1.5 text-gray-600 hover:text-gray-900 text-sm">
                                <FaCog className="mr-1 text-xs" /> Settings
                            </Link>
                            <div className="w-px h-4 bg-gray-300"></div>
                            {userData?.Invigilator?.role === 'technician' && (liveExamData?.timer_mode || userData?.exam?.timer_mode) === 'global' && ((liveExamData?.timer_start_type || userData?.exam?.timer_start_type) === 'manual' || !(liveExamData?.timer_start_type || userData?.exam?.timer_start_type)) && !(liveExamData?.activated_date || userData?.exam?.activated_date) && (
                                <button onClick={() => { setShowStartModal(true); setStartError(null); setStartSuccess(false); }} className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 animate-pulse">
                                    <FaPlay className="mr-1.5 text-xs" /> Start Timer
                                </button>
                            )}
                            {userData?.Invigilator?.role === 'technician' && (
                                pendingRequest ? (
                                    <div className="flex items-center px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm border border-yellow-300">
                                        <FaRegClock className="mr-1.5 text-xs animate-pulse" />
                                        Termination Pending
                                    </div>
                                ) : (
                                    <button onClick={() => { setShowTerminateModal(true); setTerminateError(null); setTerminateSuccess(false); setTerminationReason(''); }} className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                                        <FaPowerOff className="mr-1.5 text-xs" /> Terminate
                                    </button>
                                )
                            )}
                            <button onClick={fetchStudents} disabled={loadingStudents} className="p-1.5 text-gray-500 hover:text-gray-700">
                                <FaSync className={`text-sm ${loadingStudents ? 'animate-spin' : ''}`} />
                            </button>
                            <Link to="/admin-login" className="p-1.5 text-gray-500 hover:text-red-600">
                                <FaSignOutAlt className="text-sm" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-4">
                {/* Compact Exam Info Bar */}
                {userData?.exam && (
                    <div className="bg-white rounded-lg shadow-sm border mb-4 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Exam</p>
                                    <p className="text-sm font-semibold text-gray-900">{userData.exam.course || 'N/A'}</p>
                                </div>
                                <div className="h-8 w-px bg-gray-200"></div>
                                <div>
                                    <p className="text-xs text-gray-500">Duration</p>
                                    <p className="text-sm font-semibold text-gray-900">{userData.exam.exam_duration || 'N/A'} min</p>
                                </div>
                                <div className="h-8 w-px bg-gray-200"></div>
                                <div>
                                    <p className="text-xs text-gray-500">Timer</p>
                                    <p className="text-sm font-semibold text-gray-900">{userData.exam.timer_mode === 'global' ? 'Global' : 'Individual'}</p>
                                </div>
                            </div>
                            {(liveExamData?.timer_mode || userData?.exam?.timer_mode) === 'global' && (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 bg-gray-900 text-white px-2 py-1 rounded">
                                        <FaRegClock className="text-xs" />
                                        <span className="text-sm font-mono font-bold">{String(examCountdown.hours).padStart(2, '0')}:{String(examCountdown.minutes).padStart(2, '0')}:{String(examCountdown.seconds).padStart(2, '0')}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {(liveExamData?.activated_date || userData?.exam?.activated_date) ? (
                                            <span className="text-green-600">Started {new Date(liveExamData?.activated_date || userData?.exam?.activated_date).toLocaleTimeString()}</span>
                                        ) : (
                                            <span className="text-yellow-600">Not started</span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs">Total</p>
                                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <FaUsers className="text-blue-500 text-sm" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs">Pending</p>
                                <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                <FaHourglassHalf className="text-yellow-500 text-sm" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs">Checked In</p>
                                <p className="text-xl font-bold text-green-600">{stats.checkedIn}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <FaUserCheck className="text-green-500 text-sm" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs">Submitted</p>
                                <p className="text-xl font-bold text-blue-600">{stats.submitted}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <FaCheckCircle className="text-blue-500 text-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="all">All Students ({stats.total})</option>
                        <option value="pending">Pending ({stats.pending})</option>
                        <option value="checked-in">Checked In ({stats.checkedIn})</option>
                        <option value="submitted">Submitted ({stats.submitted})</option>
                    </select>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                        <p className="text-red-700 text-sm">{error}</p>
                        <button onClick={() => { setError(null); fetchStudents(); }} className="text-red-600 text-sm font-medium">Retry</button>
                    </div>
                )}

                {/* Students Grid */}
                {filteredStudents.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                        <FaGraduationCap className="text-4xl text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No students found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filteredStudents.map((student) => {
                            const isCheckedIn = Boolean(student.is_checked_in);
                            const isSubmitted = Boolean(student.is_submitted);
                            const isProcessing = checkingIn === student.id;

                            return (
                                <div key={student.id} className={`bg-white rounded-lg shadow-sm border overflow-hidden transition-all ${isSubmitted ? 'border-blue-300 bg-blue-50/30' : isCheckedIn ? 'border-green-300' : 'border-gray-200'}`}>
                                    <div className="relative">
                                        {student.image ? (
                                            <img src={`${path.replace('/api', '')}/${student.image}`} alt={student.full_name} className="w-full h-32 object-cover cursor-pointer" onClick={() => { setSelectedPhoto({ image: student.image, name: student.full_name, id: student.candidate_no }); setShowPhotoModal(true); }} />
                                        ) : (
                                            <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                                <FaGraduationCap className="text-white text-4xl opacity-50" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            {isSubmitted ? (
                                                <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">Submitted</span>
                                            ) : isCheckedIn ? (
                                                <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">Ready</span>
                                            ) : (
                                                <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">Pending</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-semibold text-sm text-gray-900 truncate">{student.full_name}</h3>
                                        <p className="text-xs text-gray-500 font-mono">{student.candidate_no}</p>
                                        <p className="text-xs text-gray-400 mt-1">{student.department}</p>
                                        {!isCheckedIn && !isSubmitted && (
                                            <button onClick={() => handleCheckIn(student)} disabled={isProcessing} className={`w-full mt-2 py-1.5 rounded text-xs font-medium ${isProcessing ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                                {isProcessing ? 'Checking...' : 'Check In'}
                                            </button>
                                        )}
                                        {isCheckedIn && !isSubmitted && (
                                            <div className="mt-2 text-xs text-green-600 font-medium flex items-center">
                                                <FaCheckCircle className="mr-1" /> Ready for exam
                                            </div>
                                        )}
                                        {isSubmitted && (
                                            <div className="mt-2 text-xs text-blue-600 font-medium flex items-center">
                                                <FaCheckCircle className="mr-1" /> Exam completed
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
