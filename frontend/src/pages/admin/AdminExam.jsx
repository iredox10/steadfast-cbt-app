import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
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
import logo from "../../../public/assets/logo.webp";

const AdminExam = () => {
    const { userId } = useParams();

    const {
        data: invigilators,
    } = useFetch(`/get-invigilators`);

    const [exams, setExams] = useState();
    const [loading, setLoading] = useState(false);
    const [showTerminateModel, setShowTerminateModel] = useState(false);
    const [showAssignInvigilator, SetshowAssignInvigilator] = useState(false);
    const [examId, setexamId] = useState();
    const [invigilator, setInvigilator] = useState();

    const [courses, setCourses] = useState();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [filterStatus, setFilterStatus] = useState("all");

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
                fetchExams();
            }
        } catch (err) {
            console.log(err);
        } finally {
            SetshowAssignInvigilator(false);
        }
    };

    const handleTerminateExam = async (id) => {
        try {
            const res = await axios.post(`${path}/terminate-exam/${id}`);
            if (res.status == 200) {
                fetchExams();
                setShowTerminateModel(false);
            }
        } catch (err) {
            console.log(err);
        }
    };

    // Filter exams based on search and status
    const filteredExams = exams?.filter((exam) => {
        const courseName =
            courses?.find((course) => course.id === exam.course_id)?.title ||
            "";
        
        // Apply search filter
        const matchesSearch = 
            courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.exam_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.exam_duration.toString().includes(searchTerm);
        
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

    // Calculate stats
    const activeExams = exams?.filter(exam => exam.activated === "yes").length || 0;
    const inactiveExams = exams?.filter(exam => exam.activated === "no").length || 0;
    const totalExams = exams?.length || 0;

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
                    <Link to="/admin-instructors" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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
                    {loading ? (
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
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {course?.title || "Unknown Course"}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {exam.exam_type}
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
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            exam.activated === "yes"
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
                                                            <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
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
                                        className={`px-3 py-1 rounded-md text-sm ${
                                            currentPage === 1
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
                                                    className={`w-8 h-8 rounded-md text-sm ${
                                                        currentPage === pageNum
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
                                        className={`px-3 py-1 rounded-md text-sm ${
                                            currentPage === totalPages
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
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    invigilator 
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
        </div>
    );
};

export default AdminExam;
