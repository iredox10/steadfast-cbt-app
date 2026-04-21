import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { path } from "../../../utils/path";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import Model from "../../components/Model";
import ViewTicketsModal from "../../components/ViewTicketsModal";
import { FaEye, FaCheck, FaTimes, FaSearch, FaFilter, FaUser, FaChevronDown, FaUserGraduate, FaChalkboardTeacher, FaClock, FaTicketAlt } from "react-icons/fa";
import { FaPenToSquare } from "react-icons/fa6";

const AdminDashboard = () => {
    const { id } = useParams();

    // Fetch current user
    const { data: currentUser } = useFetch("/user");

    const {
        data: invigilators,
        loading: invigilatorsLoading,
        err,
    } = useFetch(`/get-invigilators`);

    const [course, setCourse] = useState();
    const [exams, setExams] = useState();
    const [loading, setLoading] = useState(false);
    const [showModel, setshowModel] = useState(false);
    const [showDeleteModel, setShowDeleteModel] = useState(false);
    const [showTerminateModel, setShowTerminateModel] = useState(false);
    const [showSubmitModel, setShowSubmitModel] = useState(false);
    const [showAssignInvigilator, SetshowAssignInvigilator] = useState(false);
    const [examId, setexamId] = useState();
    const [invigilator, setInvigilator] = useState();
    const [showLockModal, setShowLockModal] = useState(false);
    const [lockMessage, setLockMessage] = useState("");

    const [courses, setCourses] = useState();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [showTicketsModal, setShowTicketsModal] = useState(false);
    const [selectedExamForTickets, setSelectedExamForTickets] = useState(null);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const res = await axios(`${path}/get-exams`);
            setExams(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios(`${path}/get-courses`);
            setCourses(res.data);
        } catch (err) {
            console.log(err);
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
            const res = await axios.post(`${path}/activate-exam/${id}`, {
                invigilator,
            });
            if (res.status == 200) {
                setShowSubmitModel(false);
                fetchExams();
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleTerminateExam = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.post(`${path}/terminate-exam/${id}`, {}, { headers });
            if (res.status == 200 || res.status == 201) {
                fetchExams();
                setShowTerminateModel(false);
            }
        } catch (err) {
            console.error("Error terminating exam:", err);
            if (err.response?.status === 403) {
                setLockMessage(err.response.data.error || "Exam cannot be terminated yet.");
                setShowLockModal(true);
                setShowTerminateModel(false);
            } else if (err.response?.status === 401) {
                alert("Authentication failed. Please log in again.");
            } else {
                alert(err.response?.data?.error || err.response?.data?.message || "Error terminating exam");
            }
        }
    };

    const handleViewTickets = (exam) => {
        setSelectedExamForTickets(exam);
        setShowTicketsModal(true);
    };

    // Filter exams based on search
    const filteredExams = exams?.filter((exam) => {
        const courseName =
            courses?.find((course) => course.id === exam.course_id)?.title ||
            "";
        return (
            courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.exam_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.exam_duration.toString().includes(searchTerm)
        );
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

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar>
                <Link
                    to={"/admin-sessions"}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 hover:text-black rounded-lg transition-colors"
                >
                    <FaClock />
                    <span>Sessions</span>
                </Link>
                <Link
                    to={"/admin-instructors"}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 hover:text-black rounded-lg transition-colors"
                >
                    <FaChalkboardTeacher />
                    <span>Instructors</span>
                </Link>
                <Link
                    to={`/admin-students/${id}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 hover:text-black rounded-lg transition-colors"
                >
                    <FaUserGraduate />
                    <span>Students</span>
                </Link>
                <Link
                    to={`/admin-tickets/${id}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 hover:text-black rounded-lg transition-colors"
                >
                    <FaTicketAlt />
                    <span>Tickets</span>
                </Link>
            </Sidebar>

            <div className="flex-1 p-6">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Exams Dashboard
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Manage and monitor exam details
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full lg:w-64 py-2 px-4 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search exams..."
                                />
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>

                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                                <FaFilter />
                            </button>

                            <div className="flex items-center gap-3 pl-4 border-l">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <FaUser className="text-gray-600" />
                                </div>
                                <div className="relative">
                                    <button className="hover:bg-gray-100 p-2 rounded-lg transition-colors">
                                        <FaChevronDown className="text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-3">Loading exams...</span>
                        </div>
                    ) : currentItems && currentItems.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Course Details
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Questions
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Scoring
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Exam Info
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status & Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentItems.map((exam, index) => (
                                            <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {indexOfFirstItem + index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {courses && courses.find(course => course.id === exam.course_id)?.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        <div className="font-medium">
                                                            Total: {exam.no_of_questions}
                                                        </div>
                                                        <div className="text-gray-500 text-sm">
                                                            Actual: {exam.actual_questions}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        <div className="font-medium">
                                                            Max Score: {exam.max_score}
                                                        </div>
                                                        <div className="text-gray-500 text-sm">
                                                            Per Question: {exam.marks_per_question}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        <div className="font-medium">
                                                            Type: {exam.exam_type}
                                                        </div>
                                                        <div className="text-gray-500 text-sm">
                                                            Duration: {exam.exam_duration} mins
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${exam.activated === "yes"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                            }`}>
                                                            {exam.activated === "yes" ? "Active" : "Inactive"}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            {currentUser?.role !== "super_admin" && exam.activated == "no" && (
                                                                <button
                                                                    onClick={() => showModelAndSetExamId(exam.id)}
                                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                                                >
                                                                    Activate
                                                                </button>
                                                            )}
                                                            {exam.activated == "yes" && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleViewTickets(exam)}
                                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                                        title="View exam tickets"
                                                                    >
                                                                        <FaTicketAlt className="mr-1" />
                                                                        Tickets
                                                                    </button>
                                                                    {currentUser?.role !== "super_admin" && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setexamId(exam.id);
                                                                                setShowTerminateModel(true);
                                                                            }}
                                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                                        >
                                                                            Terminate
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    Showing {indexOfFirstItem + 1} to{" "}
                                    {Math.min(indexOfLastItem, filteredExams?.length || 0)}{" "}
                                    of {filteredExams?.length || 0} entries
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1 rounded-md text-sm ${currentPage === 1
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
                                    >
                                        Previous
                                    </button>

                                    <div className="flex gap-1">
                                        {[...Array(totalPages)].map((_, index) => (
                                            <button
                                                key={index + 1}
                                                onClick={() => paginate(index + 1)}
                                                className={`w-8 h-8 rounded-md text-sm ${currentPage === index + 1
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                    }`}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No exams found</h3>
                            <p className="text-gray-500">There are currently no exams in the system.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Assign Invigilator Modal */}
            {showAssignInvigilator && (
                <Model>
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Assign Invigilator</h2>
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
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                        {invigilator && (
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        handleActivateExam(examId);
                                        SetshowAssignInvigilator(false);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    Assign & Activate
                                </button>
                            </div>
                        )}
                    </div>
                </Model>
            )}

            {/* Terminate Exam Modal */}
            {showTerminateModel && (
                <Model>
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="text-center mb-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mt-3">
                                Terminate Exam
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Are you sure you want to terminate this exam? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => handleTerminateExam(examId)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Yes, Terminate
                            </button>
                            <button
                                onClick={() => setShowTerminateModel(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Model>
            )}

            {/* View Tickets Modal */}
            {showTicketsModal && selectedExamForTickets && (
                <ViewTicketsModal
                    examId={selectedExamForTickets.id}
                    courseName={
                        courses?.find(
                            (course) => course.id === selectedExamForTickets.course_id
                        )?.title || "Exam"
                    }
                    onClose={() => {
                        setShowTicketsModal(false);
                        setSelectedExamForTickets(null);
                    }}
                />
            )}
            {/* Termination Locked Modal */}
            {showLockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-65 flex items-center justify-center z-[70] p-4 backdrop-blur-md">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-amber-100 animate-in fade-in zoom-in duration-300">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-amber-50 mb-4 border-2 border-amber-200">
                                <FaClock className="h-10 w-10 text-amber-600 animate-pulse" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">
                                Terminate Locked
                            </h2>
                            <p className="text-gray-600 mb-6 font-medium italic">Security enforced restriction</p>

                            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-5 mb-6 text-left shadow-inner">
                                <p className="text-amber-900 font-bold leading-relaxed text-lg">
                                    {lockMessage}
                                </p>
                            </div>

                            <p className="text-sm text-gray-500 mb-8 px-2">
                                Examination sessions are locked from manual termination until the scheduled time and all student extensions have been completed.
                            </p>

                            <button
                                onClick={() => setShowLockModal(false)}
                                className="w-full py-4 bg-gray-900 text-white text-xl font-bold rounded-xl hover:bg-black transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
                            >
                                <FaCheck className="text-sm" /> I Understand
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
