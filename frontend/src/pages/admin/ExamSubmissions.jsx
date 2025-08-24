import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { path } from "../../../utils/path";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import { FaSearch, FaFilter, FaUser, FaChevronDown, FaUserGraduate, FaChalkboardTeacher, FaClock, FaFileCsv, FaFileExcel, FaFilePdf } from "react-icons/fa";

const AdminExamSubmissions = () => {
    const { id } = useParams();

    // State for exam submissions data
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Fetch exam submissions with authentication
    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            const res = await axios.get(`${path}/exam-submissions`, { headers });
            setSubmissions(res.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching exam submissions:", err);
            if (err.response?.status === 401) {
                setError("Authentication failed. Please log in again.");
            } else {
                setError(err.response?.data?.message || "Error loading exam submissions");
            }
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetching
    useEffect(() => {
        fetchSubmissions();
    }, []);

    // Filter submissions based on search term
    const filteredSubmissions = submissions?.filter(submission => {
        const studentName = submission.student?.full_name?.toLowerCase() || "";
        const courseName = submission.course?.title?.toLowerCase() || "";
        const examType = submission.exam?.exam_type?.toLowerCase() || "";
        const searchTermLower = searchTerm.toLowerCase();
        
        return (
            studentName.includes(searchTermLower) ||
            courseName.includes(searchTermLower) ||
            examType.includes(searchTermLower)
        );
    }) || [];

    // Calculate pagination values
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSubmissions = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((filteredSubmissions.length || 0) / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handle export
    const handleExport = async (format) => {
        try {
            const headers = getAuthHeaders();
            const response = await axios.get(`${path}/exam-submissions/export/${format}`, {
                headers,
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `exam_submissions.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed:", error);
            if (error.response?.status === 401) {
                console.error("Authentication failed during export");
            }
        }
    };

    // Handle loading state
    if (loading) {
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
                </Sidebar>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <i className="fas fa-spinner fa-spin text-blue-500 text-3xl mb-4"></i>
                        <p className="text-gray-600">Loading exam submissions...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Handle error state
    if (error) {
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
                </Sidebar>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-md">
                        <i className="fas fa-exclamation-triangle text-yellow-500 text-3xl mb-4"></i>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h3>
                        <p className="text-gray-600 mb-6">Unable to load exam submissions. Please try again later.</p>
                        <button
                            onClick={fetchSubmissions}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
            </Sidebar>

            <div className="flex-1 p-6">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Exam Submissions
                            </h1>
                            <p className="text-gray-600 mt-1">
                                View and manage all exam submissions
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full lg:w-64 py-2 px-4 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search submissions..."
                                />
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>

                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                                <FaFilter />
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleExport('csv')}
                                    className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    title="Export to CSV"
                                >
                                    <FaFileCsv />
                                    <span className="hidden sm:inline">CSV</span>
                                </button>
                                <button
                                    onClick={() => handleExport('excel')}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    title="Export to Excel"
                                >
                                    <FaFileExcel />
                                    <span className="hidden sm:inline">Excel</span>
                                </button>
                                <button
                                    onClick={() => handleExport('pdf')}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    title="Export to PDF"
                                >
                                    <FaFilePdf />
                                    <span className="hidden sm:inline">PDF</span>
                                </button>
                            </div>

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
                    {currentSubmissions && currentSubmissions.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Student
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Course
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Exam Type
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Questions
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Score
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Submitted At
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentSubmissions.map((submission, index) => (
                                            <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {indexOfFirstItem + index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {submission.student?.full_name || "N/A"}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {submission.student?.candidate_no || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {submission.course?.title || "N/A"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {submission.exam?.exam_type || "N/A"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        <div className="font-medium">
                                                            Total: {submission.total_questions}
                                                        </div>
                                                        <div className="text-gray-500 text-sm">
                                                            Answered: {submission.answered_questions}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {submission.score} / {submission.total_questions}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(submission.submitted_at).toLocaleString()}
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
                                    {Math.min(indexOfLastItem, filteredSubmissions?.length || 0)}{" "}
                                    of {filteredSubmissions?.length || 0} entries
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
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No exam submissions found</h3>
                            <p className="text-gray-500">There are currently no exam submissions in the system.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminExamSubmissions;