import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { path } from "../../../utils/path";
import axios from "axios";
import {
    FaEye,
    FaTimes,
    FaSearch,
    FaBook,
    FaListAlt,
    FaPlay,
    FaStop,
    FaUsers,
    FaQuestionCircle,
    FaRegClock,
    FaMedal,
    FaCog,
    FaSignOutAlt,
    FaBell,
    FaChalkboardTeacher,
    FaCalendarAlt
} from "react-icons/fa";
import logo from "../../../public/assets/buk.png";

const AdminExam = () => {
    const { userId } = useParams();

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
    }, []);

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
    };

    const handleActivateExam = async (id) => {
        try {
            const headers = getAuthHeaders();
            const res = await axios.post(`${path}/activate-exam/${id}`, {
                invigilator,
            }, { headers });
            if (res.status == 200) {
                fetchExams();
            }
        } catch (err) {
            console.error("Error activating exam:", err);
            if (err.response?.status === 401) {
                console.error("Authentication failed");
            }
        } finally {
            SetshowAssignInvigilator(false);
        }
    };

    const handleTerminateExam = async (id) => {
        try {
            const headers = getAuthHeaders();
            const res = await axios.post(`${path}/terminate-exam/${id}`, {}, { headers });
            if (res.status == 200) {
                fetchExams();
                setShowTerminateModel(false);
            }
        } catch (err) {
            console.error("Error terminating exam:", err);
            if (err.response?.status === 401) {
                console.error("Authentication failed");
            }
        }
    };

    const handleViewExam = (exam) => {
        setSelectedExam(exam);
        setShowViewModal(true);
    };

    // Filter exams based on search and status
    const filteredExams = Array.isArray(exams) ? exams.filter((exam) => {
        // Remove terminated exams from the list
        // Terminated exams are identified by having finished_time set (exam was completed/terminated)
        if (exam.finished_time !== null) {
            return false; // Don't show terminated exams
        }

        const courseName =
            courses?.find((course) => course.id === exam.course_id)?.title ||
            "";

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
    }) : [];

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredExams?.slice(
        indexOfFirstItem,
        indexOfLastItem,
    );
    const totalPages = Math.ceil((filteredExams?.length || 0) / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calculate stats
    const activeExams = Array.isArray(exams) ? exams.filter(exam => exam.activated === "yes").length : 0;
    const inactiveExams = Array.isArray(exams) ? exams.filter(exam => exam.activated === "no").length : 0;
    const totalExams = Array.isArray(exams) ? exams.length : 0;

    // Stats cards matching admin dashboard
    const stats = [
        { title: "Total Exams", value: totalExams, icon: <FaListAlt /> },
        { title: "Active Exams", value: activeExams, icon: <FaPlay /> },
        { title: "Inactive Exams", value: inactiveExams, icon: <FaStop /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            {/* Sidebar - Matching Admin Dashboard exactly */}
            <aside className="w-64 bg-white p-6 flex-shrink-0 border-r border-gray-200">
                <div className="flex items-center mb-10">
                    <img src={logo} alt="School Logo" className="h-10 w-10 mr-3" />
                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                </div>
                <nav className="space-y-2">
                    <Link to={`/dashboard/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaListAlt className="mr-3" /> Dashboard
                    </Link>
                    <Link to="/admin-sessions" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaCalendarAlt className="mr-3" /> Sessions
                    </Link>
                    <Link to={`/admin-students/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaUsers className="mr-3" /> Students
                    </Link>
                    <Link to={`/admin-instructors/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaChalkboardTeacher className="mr-3" /> Instructors
                    </Link>
                    <Link to="/exam-archives" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaBook className="mr-3" /> Exam Archives
                    </Link>
                    <Link to={`/admin-exam/${userId}`} className="flex items-center p-3 bg-blue-500 text-white rounded-lg">
                        <FaBook className="mr-3" /> Exams
                    </Link>
                </nav>
                <div className="absolute bottom-6 left-6 right-6 w-52">
                    <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaCog className="mr-3" /> Settings
                    </Link>
                    <Link to="/admin-login" className="flex items-center p-3 mt-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <FaSignOutAlt className="mr-3" /> Logout
                    </Link>
                </div>
            </aside>

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
                        <button className="p-3 bg-white border rounded-full hover:bg-gray-100">
                            <FaBell className="text-gray-600" />
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
                                                    Invigilator
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
                                            const course = courses?.find(c => c.id === exam.course_id);
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
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${exam.activated === "yes"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                            }`}>
                                                            {exam.activated === "yes" ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-2">
                                                            {exam.activated === "no" ? (
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
                                                                        setShowTerminateModel(true);
                                                                    }}
                                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                                >
                                                                    <FaStop className="mr-1" /> Terminate
                                                                </button>
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

            {/* Assign Invigilator Modal */}
            {showAssignInvigilator && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Assign Invigilator</h2>
                            <button
                                onClick={() => {
                                    SetshowAssignInvigilator(false);
                                    setInvigilator("");
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Choose Invigilator
                            </label>
                            <select
                                onChange={(e) => {
                                    setInvigilator(e.target.value);
                                }}
                                name="invigilator"
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="" disabled selected>
                                    Select Invigilator
                                </option>
                                {invigilators && invigilators.map((invigilator) => (
                                    <option key={invigilator.id} value={invigilator.email}>
                                        {invigilator.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => SetshowAssignInvigilator(false)}
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
                                        {courses?.find(c => c.id === selectedExam.course_id)?.title || "Course Information"}
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
                                <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${
                                    selectedExam.activated === "yes"
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
                                        {courses?.find(c => c.id === selectedExam.course_id)?.code || "N/A"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {courses?.find(c => c.id === selectedExam.course_id)?.title || "Unknown Course"}
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

                            {/* Invigilator Information */}
                            {selectedExam.invigilator && (
                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
                                    <div className="flex items-center mb-2">
                                        <FaUsers className="text-indigo-600 mr-2" />
                                        <h3 className="text-sm font-semibold text-gray-700">Assigned Invigilator</h3>
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
                                </div>
                            )}

                            {/* Additional Details */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Exam ID:</span>
                                        <span className="font-semibold text-gray-900 font-mono">#{selectedExam.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Course ID:</span>
                                        <span className="font-semibold text-gray-900 font-mono">#{selectedExam.course_id}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Created At:</span>
                                        <span className="font-semibold text-gray-900">
                                            {selectedExam.created_at 
                                                ? new Date(selectedExam.created_at).toLocaleString()
                                                : "N/A"}
                                        </span>
                                    </div>
                                    {selectedExam.updated_at && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Last Updated:</span>
                                            <span className="font-semibold text-gray-900">
                                                {new Date(selectedExam.updated_at).toLocaleString()}
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
        </div>
    );
};

export default AdminExam;
