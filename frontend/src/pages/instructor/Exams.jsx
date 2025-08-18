import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import Sidebar from "../../components/Sidebar";
import { FaCheck, FaTimes, FaPlus, FaSearch, FaChevronDown } from "react-icons/fa";
import { format } from "date-fns";
import axios from "axios";
import { path } from "../../../utils/path";

const Exams = () => {
    const { userId, courseId } = useParams();

    const [showModel, setshowModel] = useState(false);
    const [showSubmitModel, setShowSubmitModel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const {
        data: course,
        loading: courseLoading,
        err: courseErr,
    } = useFetch(`/get-course/${courseId}`);

    const [maxScore, setMaxScore] = useState("");
    const [instructions, setInstructions] = useState("");
    const [noOfQuestions, setNoOfQuestions] = useState("");
    const [actualQuestions, setActualQuestions] = useState("");
    const [examType, setExamType] = useState("");
    const [examDuration, setExamDuration] = useState("");
    const [marksPerQuestion, setMarksPerQuestion] = useState("");

    const [exams, setExams] = useState([]);
    const [exam, setExam] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const res = await axios(`${path}/get-exams/${userId}/${courseId}`);
            setExams(res.data);
        } catch (err) {
            setErr(err.response?.data?.message || "Error fetching exams");
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId && courseId) {
            fetchExams();
        }
    }, [userId, courseId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(
                `${path}/add-exam/${userId}/${courseId}`,
                {
                    instructions,
                    max_score: maxScore,
                    no_of_questions: noOfQuestions,
                    actual_questions: actualQuestions,
                    exam_type: examType,
                    exam_duration: examDuration,
                    marks_per_question: marksPerQuestion,
                }
            );
            if (res.status === 201) {
                setshowModel(false);
                fetchExams();
                // Reset form fields
                setInstructions("");
                setMaxScore("");
                setNoOfQuestions("");
                setActualQuestions("");
                setExamType("");
                setExamDuration("");
                setMarksPerQuestion("");
            }
        } catch (err) {
            setErr(err.response?.data?.message || "Error creating exam");
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleShowSubmitModel = async (examId) => {
        try {
            setLoading(true);
            const res = await axios(`${path}/get-exam-by-id/${examId}`);
            setExam(res.data);
            setShowSubmitModel(true);
        } catch (error) {
            setErr(error.response?.data?.message || "Error fetching exam");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitExam = async () => {
        if (!exam) return;
        try {
            setLoading(true);
            const res = await axios.post(`${path}/submit-exam/${exam.id}`);
            setShowSubmitModel(false);
            fetchExams();
        } catch (error) {
            setErr(error.response?.data?.message || "Error submitting exam");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // Filter exams based on search term
    const filteredExams = exams?.filter((exam) => {
        const courseTitle = course?.title?.toLowerCase() || "";
        const examType = exam?.exam_type?.toLowerCase() || "";
        const examDuration = exam?.exam_duration?.toString() || "";
        const searchTermLower = searchTerm.toLowerCase();
        
        return (
            courseTitle.includes(searchTermLower) ||
            examType.includes(searchTermLower) ||
            examDuration.includes(searchTermLower)
        );
    }) || [];

    // Calculate pagination values
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredExams.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((filteredExams.length || 0) / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handle course loading and error states
    if (courseLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar>
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
                        <p className="text-gray-600">Loading course information...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (courseErr) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar>
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
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Course</h3>
                        <p className="text-gray-600 mb-6">Unable to load course information. Please try again later.</p>
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
                    to={`/instructor/${userId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <i className="fas fa-book"></i>
                    <span>Courses</span>
                </Link>
                <Link
                    to={`/instructor-student/${userId}/${courseId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <i className="fas fa-users"></i>
                    <span>Students</span>
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
                            {course?.title || "Course"} Exams
                        </h1>
                        <p className="text-gray-600">
                            Manage and monitor exams for this course
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search exams..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <button
                            onClick={() => setshowModel(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
                            disabled={loading}
                        >
                            <FaPlus />
                            <span>Add Exam</span>
                        </button>
                    </div>
                </header>

                {err && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg mb-6">
                        <p>{err}</p>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        S/N
                                    </th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Course Name
                                    </th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Questions
                                    </th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading && (!exams || exams.length === 0) ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-8">
                                            <i className="fas fa-spinner fa-spin text-blue-500 text-xl"></i>
                                            <p className="text-gray-600 mt-2">Loading exams...</p>
                                        </td>
                                    </tr>
                                ) : currentItems && currentItems.length > 0 ? (
                                    currentItems.map((exam, index) => (
                                        <tr
                                            key={exam.id}
                                            className="hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {indexOfFirstItem + index + 1}
                                            </td>
                                            <td className="py-4 px-6">
                                                <Link
                                                    to={`/exam-questions/${userId}/${courseId}/${exam.id}`}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    {course?.title || "Course"}
                                                </Link>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {exam.no_of_questions || 0} / {exam.actual_questions || 0}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {exam.exam_duration || 0} min
                                            </td>
                                            <td className="py-4 px-6">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        exam.exam_type === "school"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-purple-100 text-purple-800"
                                                    }`}
                                                >
                                                    {exam.exam_type || "N/A"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {exam.submission_status === "submitted" ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <FaCheck className="w-3 h-3" />
                                                        Submitted
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <FaTimes className="w-3 h-3" />
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {exam.updated_at ? format(new Date(exam.updated_at), "Pp") : "N/A"}
                                            </td>
                                            <td className="py-4 px-6">
                                                <button
                                                    onClick={() => handleShowSubmitModel(exam.id)}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                    disabled={loading || exam.submission_status === "submitted"}
                                                >
                                                    {exam.submission_status === "submitted" ? "Submitted" : "Submit"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-8">
                                            <i className="fas fa-file-alt text-gray-300 text-3xl mb-3"></i>
                                            <p className="text-gray-500">No exams found</p>
                                            <p className="text-gray-400 text-sm mt-1">Create your first exam to get started</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredExams.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing {indexOfFirstItem + 1} to{" "}
                                    {Math.min(indexOfLastItem, filteredExams.length)}{" "}
                                    of {filteredExams.length} entries
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1 || loading}
                                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                                            currentPage === 1 || loading
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
                                            disabled={loading}
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
                                        disabled={currentPage === totalPages || loading}
                                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                                            currentPage === totalPages || loading
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

            {/* Submit Exam Confirmation Modal */}
            {showSubmitModel && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                        <div className="text-center">
                            <div className="mb-6">
                                <i className="fas fa-exclamation-circle text-yellow-500 text-4xl"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Submit Exam?
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Are you sure you want to submit this exam? This action cannot be undone.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleSubmitExam}
                                    className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                    ) : null}
                                    Yes, Submit
                                </button>
                                <button
                                    onClick={() => setShowSubmitModel(false)}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Exam Modal */}
            {showModel && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                Add New Exam
                            </h2>
                            <button
                                onClick={() => setshowModel(false)}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
                                disabled={loading}
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {err && (
                                <div className="p-4 text-red-700 bg-red-100 rounded-lg">
                                    <p>{err}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Exam Type
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-white px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-700 hover:border-gray-300"
                                        onChange={(e) => setExamType(e.target.value)}
                                        value={examType}
                                        disabled={loading}
                                        required
                                    >
                                        <option value="">Select Exam Type</option>
                                        <option value="school">School Examination</option>
                                        <option value="external">External Assessment</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                        <FaChevronDown />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Instructions
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="3"
                                    placeholder="Enter exam instructions..."
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Score
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter max score"
                                        value={maxScore}
                                        onChange={(e) => setMaxScore(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter duration in minutes"
                                        value={examDuration}
                                        onChange={(e) => setExamDuration(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Questions
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter total questions"
                                        value={noOfQuestions}
                                        onChange={(e) => setNoOfQuestions(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Questions to Display
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter questions to display"
                                        value={actualQuestions}
                                        onChange={(e) => setActualQuestions(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Marks per Question
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter marks per question"
                                    value={marksPerQuestion}
                                    onChange={(e) => setMarksPerQuestion(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setshowModel(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Adding...
                                    </>
                                ) : (
                                    "Add Exam"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Exams;