import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { path } from "../../../utils/path";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import { FaSearch, FaFileCsv, FaFileExcel, FaFilePdf } from "react-icons/fa";

const ExamSubmissions = () => {
    const { userId, courseId } = useParams();
    
    const {
        data: submissions,
        loading,
        error,
        refetch
    } = useFetch(`/exam-submissions-by-course/${courseId}`);
    
    const { data: course } = useFetch(`/get-course/${courseId}`);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Filter submissions based on search term
    const filteredSubmissions = submissions?.filter(submission => {
        const studentName = submission.student?.full_name?.toLowerCase() || "";
        const searchTermLower = searchTerm.toLowerCase();
        
        return (
            studentName.includes(searchTermLower)
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
            const response = await axios.get(`${path}/exam-submissions/export/${format}`, {
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
        }
    };

    // Handle loading state
    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar>
                    <Link
                        to={`/exams/${userId}/${courseId}`}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <i className="fas fa-file-alt"></i>
                        <span>Exams</span>
                    </Link>
                    <Link
                        to={`/instructor/${userId}`}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <i className="fas fa-book"></i>
                        <span>Courses</span>
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
                        to={`/exams/${userId}/${courseId}`}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <i className="fas fa-file-alt"></i>
                        <span>Exams</span>
                    </Link>
                    <Link
                        to={`/instructor/${userId}`}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <i className="fas fa-book"></i>
                        <span>Courses</span>
                    </Link>
                </Sidebar>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-md">
                        <i className="fas fa-exclamation-triangle text-yellow-500 text-3xl mb-4"></i>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h3>
                        <p className="text-gray-600 mb-6">Unable to load exam submissions. Please try again later.</p>
                        <button
                            onClick={() => window.location.reload()}
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
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <Sidebar>
                <Link
                    to={`/exams/${userId}/${courseId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <i className="fas fa-file-alt"></i>
                    <span>Exams</span>
                </Link>
                <Link
                    to={`/instructor/${userId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <i className="fas fa-book"></i>
                    <span>Courses</span>
                </Link>
                <Link
                    to={`/question-bank/${userId}/${courseId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <i className="fas fa-question-circle"></i>
                    <span>Question Bank</span>
                </Link>
            </Sidebar>
            
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            {course?.title || "Course"} Exam Submissions
                        </h1>
                        <p className="text-gray-600">
                            View and export student exam submissions
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search submissions..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
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
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S/N</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Questions</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Answered</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Correct Answers</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Score</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentSubmissions && currentSubmissions.length > 0 ? (
                                    currentSubmissions.map((submission, index) => (
                                        <tr key={submission.id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="py-4 px-6 text-sm text-gray-600">{indexOfFirstItem + index + 1}</td>
                                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                                {submission.student?.full_name || "N/A"}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {submission.total_questions}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {submission.answered_questions}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {submission.correct_answers}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {submission.score}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {new Date(submission.submitted_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8">
                                            <i className="fas fa-file-alt text-gray-300 text-3xl mb-3"></i>
                                            <p className="text-gray-500">No exam submissions found</p>
                                            <p className="text-gray-400 text-sm mt-1">Students have not submitted any exams yet</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredSubmissions.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing {indexOfFirstItem + 1} to{" "}
                                    {Math.min(indexOfLastItem, filteredSubmissions.length)}{" "}
                                    of {filteredSubmissions.length} submissions
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                                            currentPage === 1
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                        }`}
                                    >
                                        Previous
                                    </button>

                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index + 1}
                                            onClick={() => paginate(index + 1)}
                                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                                                currentPage === index + 1
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                                            currentPage === totalPages
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ExamSubmissions;