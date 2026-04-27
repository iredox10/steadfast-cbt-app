import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { path } from "../../../utils/path";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import {
    FaEye,
    FaCheck,
    FaTimes,
    FaSearch,
    FaPlay,
    FaStop,
    FaQuestionCircle,
    FaRegClock,
    FaMedal,
    FaListAlt,
    FaBell,
    FaBook,
    FaCalendarAlt,
    FaUsers,
    FaPowerOff,
    FaExclamationTriangle,
    FaInfoCircle
} from "react-icons/fa";
import AdminSidebar from "../../components/AdminSidebar";

const AdminExam = () => {
    const { id: userId } = useParams();
    
    // Fetch current user
    const { data: currentUser } = useFetch("/user");

    // State for invigilators data
    const [invigilators, setInvigilators] = useState([]);
    const [invigilatorsLoading, setInvigilatorsLoading] = useState(true);

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Fetch invigilators with authentication
    const fetchInvigilators = async () => {
        try {
            setInvigilatorsLoading(true);
            const headers = getAuthHeaders();
            const res = await axios.get(`${path}/get-invigilators`, { headers });
            setInvigilators(res.data);
        } catch (err) {
            console.error("Error fetching invigilators:", err);
        } finally {
            setInvigilatorsLoading(false);
        }
    };

    useEffect(() => {
        fetchInvigilators();
    }, []);

    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showTerminateModel, setShowTerminateModel] = useState(false);
    const [showAssignInvigilator, SetshowAssignInvigilator] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [examId, setexamId] = useState();
    const [invigilator, setInvigilator] = useState();
    const [timerMode, setTimerMode] = useState("individual");
    const [showLockModal, setShowLockModal] = useState(false);
    const [lockMessage, setLockMessage] = useState("");
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [showRequestsModal, setShowRequestsModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showRequestDetailModal, setShowRequestDetailModal] = useState(false);
    const [reviewReason, setReviewReason] = useState("");
    const [processingRequest, setProcessingRequest] = useState(null);
    const [requestError, setRequestError] = useState(null);

    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [filterStatus, setFilterStatus] = useState("all");

    const fetchExams = async () => {
        setLoading(true);
        setError(null);
        try {
            const headers = getAuthHeaders();
            const res = await axios.get(`${path}/get-exams`, { headers });
            // Ensure the response data is an array
            setExams(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching exams:", err);
            if (err.response?.status === 401) {
                setError("Authentication failed. Please log in again.");
            } else {
                setError(err.response?.data?.message || "Error loading exams");
            }
            setExams([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            setLoadingRequests(true);
            const headers = getAuthHeaders();
            const res = await axios.get(`${path}/pending-termination-requests`, { headers });
            const requests = res.data.requests || [];
            setPendingRequests(requests);
            return requests;
        } catch (err) {
            console.error("Error fetching pending requests:", err);
            return [];
        } finally {
            setLoadingRequests(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const headers = getAuthHeaders();
            const res = await axios.get(`${path}/get-courses`, { headers });
            // Ensure the response data is an array
            setCourses(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching courses:", err);
            if (err.response?.status === 401) {
                console.error("Authentication failed");
            }
            setCourses([]); // Set empty array on error
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const showModelAndSetExamId = (id) => {
        SetshowAssignInvigilator(true);
        setexamId(id);
        setTimerMode("individual");
        setInvigilator("");
    };

    const handleActivateExam = async (id) => {
        try {
            const headers = getAuthHeaders();
            const res = await axios.post(`${path}/activate-exam/${id}`, {
                invigilator,
                timer_mode: timerMode,
            }, { headers });
            if (res.status == 200) {
                fetchExams();
                fetchPendingRequests();
            }
        } catch (err) {
            console.error("Error activating exam:", err);
            if (err.response?.status === 401) {
                console.error("Authentication failed");
            }
        } finally {
            SetshowAssignInvigilator(false);
            setTimerMode("individual");
        }
    };

    const handleTerminateExam = async (id) => {
        const currentRequests = pendingRequests.length > 0 ? pendingRequests : await fetchPendingRequests();
        const pendingForExam = currentRequests.find(r => Number(r.exam_id) === Number(id));
        if (pendingForExam) {
            setSelectedRequest(pendingForExam);
            setReviewReason("");
            setRequestError(null);
            setShowRequestDetailModal(true);
            return;
        }

        try {
            const headers = getAuthHeaders();
            const res = await axios.post(`${path}/terminate-exam/${id}`, {}, { headers });
            if (res.status == 200 || res.status == 201) {
                fetchExams();
                setShowTerminateModel(false);
            }
        } catch (err) {
            console.error("Error terminating exam:", err);
            if (err.response?.status === 400 && err.response?.data?.error?.includes("No approved termination request")) {
                alert("A technician must first request termination for this exam. Please check the pending requests (bell icon) or ask the technician to submit a request.");
            } else if (err.response?.status === 403) {
                setLockMessage(err.response.data.error || "Exam cannot be terminated yet.");
                setShowLockModal(true);
                setShowTerminateModel(false);
            } else if (err.response?.status === 401) {
                console.error("Authentication failed");
            } else {
                alert(err.response?.data?.error || err.response?.data?.message || "Error terminating exam");
            }
        }
    };

    const handleViewExam = (exam) => {
        setSelectedExam(exam);
        setShowViewModal(true);
    };

    const handleApproveRequest = async (requestId) => {
        if (!reviewReason.trim()) {
            setRequestError("You must provide a reason for approval.");
            return;
        }
        setProcessingRequest("approve");
        setRequestError(null);
        try {
            const headers = getAuthHeaders();
            const res = await axios.post(`${path}/approve-termination-request/${requestId}`, {
                reason: reviewReason,
            }, { headers });
            if (res.status === 200) {
                fetchPendingRequests();
                fetchExams();
                setShowRequestDetailModal(false);
                setSelectedRequest(null);
                setReviewReason("");
            }
        } catch (err) {
            console.error("Error approving request:", err);
            setRequestError(err.response?.data?.error || "Failed to approve request.");
        } finally {
            setProcessingRequest(null);
        }
    };

    const handleRejectRequest = async (requestId) => {
        if (!reviewReason.trim()) {
            setRequestError("You must provide a reason for rejection.");
            return;
        }
        setProcessingRequest("reject");
        setRequestError(null);
        try {
            const headers = getAuthHeaders();
            const res = await axios.post(`${path}/reject-termination-request/${requestId}`, {
                reason: reviewReason,
            }, { headers });
            if (res.status === 200) {
                fetchPendingRequests();
                setShowRequestDetailModal(false);
                setSelectedRequest(null);
                setReviewReason("");
            }
        } catch (err) {
            console.error("Error rejecting request:", err);
            setRequestError(err.response?.data?.error || "Failed to reject request.");
        } finally {
            setProcessingRequest(null);
        }
    };

    const openRequestDetail = (request) => {
        setSelectedRequest(request);
        setReviewReason("");
        setRequestError(null);
        setShowRequestDetailModal(true);
    };

    // Calculate stats based on VISIBLE exams (matching table logic)
    const getBaseVisibleExams = () => {
        if (!Array.isArray(exams)) return [];

        console.log("Filtering Exams:", exams); // Debug log

        return exams.filter(exam => {
            // Always hide terminated exams (they belong in archives)
            if (exam.finished_time !== null) {
                return false;
            }

            // Show if it's Active OR Submitted
            // If it's just 'not_submitted' (draft), hide it
            if (exam.activated === 'yes' || exam.submission_status === 'submitted') {
                return true;
            }

            return false;
        });
    };

    const visibleExams = getBaseVisibleExams();

    // Filter visible exams based on search and status dropdown
    const filteredExams = visibleExams.filter((exam) => {
        const course = exam.course || courses?.find(c => c.id === exam.course_id);
        const courseName = course?.title || "";

        // Apply search filter
        const matchesSearch =
            courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (exam.exam_type && exam.exam_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (exam.exam_duration && exam.exam_duration.toString().includes(searchTerm));

        // Apply status filter
        let matchesStatus = true;
        if (filterStatus === "active") {
            matchesStatus = exam.activated === "yes";
        } else if (filterStatus === "inactive") {
            matchesStatus = exam.activated === "no";
        }

        return matchesSearch && matchesStatus;
    });

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredExams?.slice(
        indexOfFirstItem,
        indexOfLastItem,
    );
    const totalPages = Math.ceil((filteredExams?.length || 0) / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calculate stats based on VISIBLE exams
    const activeExams = visibleExams.filter(exam => exam.activated === "yes").length;
    const inactiveExams = visibleExams.filter(exam => exam.activated === "no").length;
    const totalExams = visibleExams.length;

    // Stats cards matching admin dashboard
    const stats = [
        { title: "Total Exams", value: totalExams, icon: <FaListAlt /> },
        { title: "Active Exams", value: activeExams, icon: <FaPlay /> },
        { title: "Inactive Exams", value: inactiveExams, icon: <FaStop /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <AdminSidebar userId={userId} />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Header - Matching Admin Dashboard */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Exam Management
                        </h2>
                        <p className="text-gray-500">Create, activate, and manage examinations</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => {
                                fetchPendingRequests();
                                setShowRequestsModal(true);
                            }}
                            className="p-3 bg-white border rounded-full hover:bg-gray-100 relative"
                        >
                            <FaBell className="text-gray-600" />
                            {pendingRequests.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                {/* Stats Cards - Matching Admin Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                            <div className="p-4 bg-blue-100 rounded-full text-blue-500">
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by course, exam type..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Exams</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Exams Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {error ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                            <div className="text-red-500 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">Error Loading Exams</h3>
                            <p className="text-gray-600 mb-6 text-center">{error}</p>
                            <button
                                onClick={fetchExams}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-xl font-medium text-gray-700">Loading exams...</p>
                        </div>
                    ) : currentItems && currentItems.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Course
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    <FaQuestionCircle className="mr-2" />
                                                    Questions
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    <FaMedal className="mr-2" />
                                                    Scoring
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    <FaRegClock className="mr-2" />
                                                    Duration
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    <FaUsers className="mr-2" />
                                                    Technician
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentItems.map((exam) => {
                                            const course = exam.course || courses?.find(c => c.id === exam.course_id);
                                            return (
                                                <tr key={exam.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                                <FaBook className="text-blue-500" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {course?.title || "Unknown Course"}
                                                                    </div>
                                                                    {/* Show "Previously Activated" badge for inactive exams that have been activated before */}
                                                                    {exam.activated_date && exam.activated === "no" && !exam.finished_time && (
                                                                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                                                            <FaPlay className="text-[10px]" />
                                                                            Previously Activated
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {exam.exam_type}
                                                                    {exam.activated_date && exam.activated === "no" && !exam.finished_time && (
                                                                        <span className="text-gray-400 ml-2">
                                                                            • Last activated: {new Date(exam.activated_date).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            <div className="font-medium">
                                                                {exam.actual_questions} / {exam.no_of_questions}
                                                            </div>
                                                            <div className="text-gray-500 text-sm">
                                                                questions
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            <div className="font-medium">
                                                                {exam.max_score} pts
                                                            </div>
                                                            <div className="text-gray-500 text-sm">
                                                                {exam.marks_per_question} pts each
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {exam.exam_duration} minutes
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {exam.invigilator || "Not assigned"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${exam.activated === "yes"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                                }`}>
                                                                {exam.activated === "yes" ? "Active" : "Inactive"}
                                                            </span>
                                                            {pendingRequests.some(r => r.exam_id === exam.id) && (
                                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-fit bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse">
                                                                    <FaPowerOff className="mr-1 mt-0.5" /> Termination Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-2">
                                                            {currentUser?.role !== "super_admin" && (
                                                                exam.activated === "no" ? (
                                                                    <button
                                                                        onClick={() => showModelAndSetExamId(exam.id)}
                                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                                    >
                                                                        <FaPlay className="mr-1" /> Activate
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => {
                                                                            setexamId(exam.id);
                                                                            handleTerminateExam(exam.id);
                                                                        }}
                                                                        className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${pendingRequests.some(r => r.exam_id === exam.id)
                                                                            ? "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500"
                                                                            : "bg-red-500 hover:bg-red-600 focus:ring-red-500"
                                                                            }`}
                                                                    >
                                                                        {pendingRequests.some(r => r.exam_id === exam.id) ? (
                                                                            <>
                                                                                <FaPowerOff className="mr-1" /> Review Request
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <FaStop className="mr-1" /> Terminate
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )
                                                            )}
                                                            <button
                                                                onClick={() => handleViewExam(exam)}
                                                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                            >
                                                                <FaEye className="mr-1" /> View
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredExams?.length || 0)} of {filteredExams?.length || 0} exams
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1 rounded-md text-sm ${currentPage === 1
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                                            }`}
                                    >
                                        Previous
                                    </button>

                                    <div className="flex gap-1">
                                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = index + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = index + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + index;
                                            } else {
                                                pageNum = currentPage - 2 + index;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => paginate(pageNum)}
                                                    className={`w-8 h-8 rounded-md text-sm ${currentPage === pageNum
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                                            }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <FaListAlt className="mx-auto h-12 w-12" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                {searchTerm || filterStatus !== 'all'
                                    ? "No exams match your search/filter criteria"
                                    : "No exams found"}
                            </h3>
                            <p className="text-gray-500">
                                {searchTerm || filterStatus !== 'all'
                                    ? "Try adjusting your search or filter criteria"
                                    : "Get started by creating a new exam"}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Assign Technician Modal */}
            {showAssignInvigilator && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Assign Technician</h2>
                            <button
                                onClick={() => {
                                    SetshowAssignInvigilator(false);
                                    setInvigilator("");
                                    setTimerMode("individual");
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Choose Technician
                            </label>
                            <select
                                onChange={(e) => {
                                    setInvigilator(e.target.value);
                                }}
                                name="invigilator"
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="" disabled selected>
                                    Select Technician
                                </option>
                                {invigilators && invigilators.map((invigilator) => (
                                    <option key={invigilator.id} value={invigilator.email}>
                                        {invigilator.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Timer Mode
                            </label>
                            <div className="space-y-2">
                                <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${timerMode === "individual" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                                    <input
                                        type="radio"
                                        name="timerMode"
                                        value="individual"
                                        checked={timerMode === "individual"}
                                        onChange={(e) => setTimerMode(e.target.value)}
                                        className="mr-3 h-4 w-4 text-blue-600"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">Individual Timer</p>
                                        <p className="text-xs text-gray-500">Each student's timer starts when they begin the exam</p>
                                    </div>
                                </label>
                                <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${timerMode === "global" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                                    <input
                                        type="radio"
                                        name="timerMode"
                                        value="global"
                                        checked={timerMode === "global"}
                                        onChange={(e) => setTimerMode(e.target.value)}
                                        className="mr-3 h-4 w-4 text-blue-600"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">Global Timer</p>
                                        <p className="text-xs text-gray-500">All students share one timer starting when exam is activated</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    SetshowAssignInvigilator(false);
                                    setInvigilator("");
                                    setTimerMode("individual");
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleActivateExam(examId);
                                }}
                                disabled={!invigilator}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${invigilator
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                Assign & Activate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Terminate Exam Modal */}
            {showTerminateModel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="text-center mb-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <FaStop className="h-6 w-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mt-3">
                                Terminate Exam
                            </h2>
                            <p className="text-gray-500 mt-2">
                                Are you sure you want to terminate this exam? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setShowTerminateModel(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleTerminateExam(examId)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                            >
                                Yes, Terminate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Exam Details Modal */}
            {showViewModal && selectedExam && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl z-10">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold mb-2 flex items-center">
                                        <FaBook className="mr-3" />
                                        Exam Details
                                    </h2>
                                    <p className="text-blue-100">
                                        {(selectedExam.course || courses?.find(c => c.id === selectedExam.course_id))?.title || "Course Information"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setSelectedExam(null);
                                    }}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Status Badge */}
                            <div className="mb-6 flex items-center gap-3">
                                <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${selectedExam.activated === "yes"
                                    ? "bg-green-100 text-green-800 border border-green-300"
                                    : "bg-red-100 text-red-800 border border-red-300"
                                    }`}>
                                    {selectedExam.activated === "yes" ? "✓ Active Exam" : "○ Inactive Exam"}
                                </span>
                                {selectedExam.activated_date && selectedExam.activated === "no" && !selectedExam.finished_time && (
                                    <span className="px-4 py-2 text-sm font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                        Previously Activated
                                    </span>
                                )}
                            </div>

                            {/* Exam Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Course Information */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center mb-2">
                                        <FaBook className="text-blue-600 mr-2" />
                                        <h3 className="text-sm font-semibold text-gray-700">Course</h3>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {(selectedExam.course || courses?.find(c => c.id === selectedExam.course_id))?.code || "N/A"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {(selectedExam.course || courses?.find(c => c.id === selectedExam.course_id))?.title || "Unknown Course"}
                                    </p>
                                </div>

                                {/* Exam Type */}
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <div className="flex items-center mb-2">
                                        <FaListAlt className="text-purple-600 mr-2" />
                                        <h3 className="text-sm font-semibold text-gray-700">Exam Type</h3>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {selectedExam.exam_type || "N/A"}
                                    </p>
                                </div>

                                {/* Duration */}
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                    <div className="flex items-center mb-2">
                                        <FaRegClock className="text-orange-600 mr-2" />
                                        <h3 className="text-sm font-semibold text-gray-700">Duration</h3>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {selectedExam.exam_duration || "0"} minutes
                                    </p>
                                </div>

                                {/* Questions */}
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center mb-2">
                                        <FaQuestionCircle className="text-green-600 mr-2" />
                                        <h3 className="text-sm font-semibold text-gray-700">Questions</h3>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {selectedExam.actual_questions || 0} / {selectedExam.no_of_questions || 0}
                                    </p>
                                    <p className="text-xs text-gray-600">Actual / Total</p>
                                </div>

                                {/* Marks per Question */}
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                    <div className="flex items-center mb-2">
                                        <FaMedal className="text-yellow-600 mr-2" />
                                        <h3 className="text-sm font-semibold text-gray-700">Marks per Question</h3>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {selectedExam.marks_per_question || 0} points
                                    </p>
                                </div>

                                {/* Maximum Score */}
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                    <div className="flex items-center mb-2">
                                        <FaMedal className="text-red-600 mr-2" />
                                        <h3 className="text-sm font-semibold text-gray-700">Maximum Score</h3>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {selectedExam.max_score || 0} points
                                    </p>
                                </div>
                            </div>

                            {/* Technician Information */}
                            {selectedExam.invigilator && (
                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
                                    <div className="flex items-center mb-2">
                                        <FaUsers className="text-indigo-600 mr-2" />
                                        <h3 className="text-sm font-semibold text-gray-700">Assigned Technician</h3>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {selectedExam.invigilator}
                                    </p>
                                </div>
                            )}

                            {/* Activation Information */}
                            {selectedExam.activated_date && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                                    <div className="flex items-center mb-2">
                                        <FaCalendarAlt className="text-gray-600 mr-2" />
                                        <h3 className="text-sm font-semibold text-gray-700">
                                            {selectedExam.activated === "yes" ? "Activated On" : "Last Activated"}
                                        </h3>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {new Date(selectedExam.activated_date).toLocaleString()}
                                    </p>
                                    {selectedExam.finished_time && (
                                        <div className="mt-3 pt-3 border-t border-gray-300">
                                            <div className="flex items-center mb-1">
                                                <FaRegClock className="text-gray-600 mr-2 text-sm" />
                                                <span className="text-sm font-semibold text-gray-700">Finished On</span>
                                            </div>
                                            <p className="text-md font-semibold text-gray-900">
                                                {new Date(selectedExam.finished_time).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Exam Statistics */}
                            {selectedExam.activated === "no" && selectedExam.finished_time && (
                                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 mb-6">
                                    <div className="flex items-center mb-3">
                                        <FaUsers className="text-teal-600 mr-2" />
                                        <h3 className="text-sm font-semibold text-gray-700">Exam Statistics</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Total Marks</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {(selectedExam.actual_questions || 0) * (selectedExam.marks_per_question || 0)} points
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Status</p>
                                            <p className="text-lg font-bold text-teal-700">
                                                Completed
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Additional Details */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600 font-medium">Exam ID:</span>
                                        <span className="font-semibold text-gray-900 font-mono bg-gray-100 px-3 py-1 rounded">#{selectedExam.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600 font-medium">Course ID:</span>
                                        <span className="font-semibold text-gray-900 font-mono bg-gray-100 px-3 py-1 rounded">#{selectedExam.course_id}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600 font-medium">Course Code:</span>
                                        <span className="font-semibold text-gray-900">
                                            {(selectedExam.course || courses?.find(c => c.id === selectedExam.course_id))?.code || "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600 font-medium">Total Possible Marks:</span>
                                        <span className="font-semibold text-gray-900">
                                            {(selectedExam.actual_questions || 0) * (selectedExam.marks_per_question || 0)} points
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600 font-medium">Created At:</span>
                                        <span className="font-semibold text-gray-900">
                                            {selectedExam.created_at
                                                ? new Date(selectedExam.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : "N/A"}
                                        </span>
                                    </div>
                                    {selectedExam.updated_at && (
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 font-medium">Last Updated:</span>
                                            <span className="font-semibold text-gray-900">
                                                {new Date(selectedExam.updated_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    {selectedExam.semester && (
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 font-medium">Semester:</span>
                                            <span className="font-semibold text-gray-900">
                                                {selectedExam.semester}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedExam(null);
                                }}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Termination Locked Modal */}
            {showLockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-65 flex items-center justify-center z-[70] p-4 backdrop-blur-md">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-amber-100 animate-in fade-in zoom-in duration-300">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-amber-50 mb-4 border-2 border-amber-200">
                                <FaRegClock className="h-10 w-10 text-amber-600 animate-pulse" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">
                                Terminate Locked
                            </h2>
                            <p className="text-gray-500 mb-6 font-medium">Exam session is still active</p>

                            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-5 mb-6 text-left shadow-inner">
                                <p className="text-amber-900 font-bold leading-relaxed text-lg">
                                    {lockMessage}
                                </p>
                            </div>

                            <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-100 italic">
                                <strong>Safety Policy:</strong> To ensure fairness and exam integrity, sessions cannot be manually terminated while any student is still within their officially allocated time (including extensions).
                            </div>

                            <button
                                onClick={() => setShowLockModal(false)}
                                className="w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
                            >
                                <FaCheck className="text-sm" /> I Understand
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Termination Requests Modal */}
            {showRequestsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center">
                                        <FaPowerOff className="mr-3" />
                                        Pending Termination Requests
                                    </h2>
                                    <p className="text-yellow-100 mt-1 text-sm">Review and manage exam termination requests from technicians</p>
                                </div>
                                <button
                                    onClick={() => setShowRequestsModal(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingRequests ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading requests...</p>
                                </div>
                            ) : pendingRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaCheck className="text-6xl text-green-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Requests</h3>
                                    <p className="text-gray-500">All termination requests have been processed.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:border-yellow-400 transition-colors bg-gray-50"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaExclamationTriangle className="text-yellow-500" />
                                                        <h3 className="font-bold text-gray-900">
                                                            Exam: {request.exam?.course?.title || `Course #${request.exam?.course_id}`}
                                                        </h3>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                                                        <div>
                                                            <span className="font-medium">Requested by:</span> {request.requester?.full_name || "Unknown"}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Submitted:</span> {new Date(request.created_at).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div className="bg-white rounded p-3 border border-gray-200">
                                                        <p className="text-sm text-gray-700">
                                                            <span className="font-medium">Reason:</span> {request.request_reason}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => openRequestDetail(request)}
                                                    className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium flex-shrink-0"
                                                >
                                                    <FaInfoCircle className="mr-1 inline" /> Review
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowRequestsModal(false)}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Detail Modal (Approve/Reject) */}
            {showRequestDetailModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center">
                                        <FaPowerOff className="mr-3" />
                                        Review Termination Request
                                    </h2>
                                    <p className="text-blue-100 mt-1 text-sm">
                                        {selectedRequest.exam?.course?.title || `Course #${selectedRequest.exam?.course_id}`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowRequestDetailModal(false);
                                        setSelectedRequest(null);
                                        setReviewReason("");
                                        setRequestError(null);
                                    }}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Request Information */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-3">Request Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Requested by:</span>
                                        <span className="font-medium text-gray-900">{selectedRequest.requester?.full_name || "Unknown"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Submitted:</span>
                                        <span className="font-medium text-gray-900">{new Date(selectedRequest.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200">
                                        <span className="text-gray-600">Reason:</span>
                                        <p className="mt-1 text-gray-900 font-medium bg-white p-3 rounded border border-gray-200">
                                            {selectedRequest.request_reason}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Exam Information */}
                            {selectedRequest.exam && (
                                <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                                    <h3 className="font-bold text-gray-900 mb-3">Exam Information</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-600">Duration:</span>
                                            <p className="font-medium text-gray-900">{selectedRequest.exam.exam_duration} minutes</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Status:</span>
                                            <p className="font-medium text-green-600">Active</p>
                                        </div>
                                        {selectedRequest.exam.invigilator && (
                                            <div className="col-span-2">
                                                <span className="text-gray-600">Technician:</span>
                                                <p className="font-medium text-gray-900">{selectedRequest.exam.invigilator}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Review Reason Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reviewReason}
                                    onChange={(e) => {
                                        setReviewReason(e.target.value);
                                        setRequestError(null);
                                    }}
                                    rows={3}
                                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none resize-none"
                                    placeholder="Provide your reason for this decision..."
                                    required
                                />
                            </div>

                            {requestError && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
                                    <p className="text-red-800 text-sm">{requestError}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRequestDetailModal(false);
                                        setSelectedRequest(null);
                                        setReviewReason("");
                                        setRequestError(null);
                                    }}
                                    className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleRejectRequest(selectedRequest.id)}
                                    disabled={processingRequest !== null}
                                    className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center"
                                >
                                    {processingRequest === "reject" ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Rejecting...
                                        </>
                                    ) : (
                                        <>
                                            <FaTimes className="mr-2" /> Reject
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleApproveRequest(selectedRequest.id)}
                                    disabled={processingRequest !== null}
                                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center"
                                >
                                    {processingRequest === "approve" ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Terminating...
                                        </>
                                    ) : (
                                        <>
                                            <FaPowerOff className="mr-2" /> Approve & Terminate
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminExam;
