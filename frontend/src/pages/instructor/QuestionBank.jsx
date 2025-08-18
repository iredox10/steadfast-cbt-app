import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { path } from "../../../utils/path";
import { FaSearch, FaBook, FaPlus } from "react-icons/fa";
import useFetch from "../../hooks/useFetch";
import Sidebar from "../../components/Sidebar";

const QuestionBank = () => {
    const { userId, courseId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const { data: course, loading: courseLoading } = useFetch(`/get-course/${courseId}`);

    useEffect(() => {
        if (userId && courseId) {
            fetchQuestions();
        }
    }, [userId, courseId]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${path}/question-bank/${userId}/${courseId}`);
            setQuestions(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch questions");
        } finally {
            setLoading(false);
        }
    };

    // Filter questions based on search term
    const filteredQuestions = questions.filter(question =>
        question.question.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentQuestions = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

    // Handle course loading state
    if (courseLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar>
                    <Link
                        to={`/instructor/${userId}`}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <FaBook />
                        <span>Courses</span>
                    </Link>
                </Sidebar>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <i className="fas fa-spinner fa-spin text-blue-500 text-3xl mb-4"></i>
                        <p className="text-gray-600">Loading question bank...</p>
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
                    <FaBook />
                    <span>Courses</span>
                </Link>
                <Link
                    to={`/exams/${userId}/${courseId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <i className="fas fa-file-alt"></i>
                    <span>Exams</span>
                </Link>
            </Sidebar>
            
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Question Bank</h1>
                        <p className="text-gray-600">Manage and reuse your exam questions for {course?.title || "this course"}</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search questions..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">
                            <FaPlus />
                            <span>Add Question</span>
                        </button>
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    {/* Questions List */}
                    {loading ? (
                        <div className="p-12 text-center">
                            <i className="fas fa-spinner fa-spin text-blue-500 text-3xl"></i>
                            <p className="text-gray-600 mt-4">Loading questions...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <i className="fas fa-exclamation-triangle text-yellow-500 text-3xl mb-4"></i>
                            <p className="text-red-500 mb-4">{error}</p>
                            <button 
                                onClick={fetchQuestions}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="p-12 text-center">
                            <i className="fas fa-question-circle text-gray-300 text-5xl mb-4"></i>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No questions found</h3>
                            <p className="text-gray-600 mb-6">Get started by adding your first question to the bank</p>
                            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                Add Question
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-gray-100">
                                {currentQuestions.map((question, index) => (
                                    <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-sm font-medium text-gray-500">
                                                        Question {indexOfFirstItem + index + 1}
                                                    </span>
                                                    <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                                                        {course?.title || "Course"}
                                                    </span>
                                                </div>
                                                <p 
                                                    className="text-gray-900 font-medium mb-4"
                                                    dangerouslySetInnerHTML={{ __html: question.question }}
                                                ></p>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-start gap-3">
                                                            <span className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-sm font-medium mt-1">
                                                                ✓
                                                            </span>
                                                            <div 
                                                                className="text-gray-700"
                                                                dangerouslySetInnerHTML={{ __html: question.correct_answer }}
                                                            ></div>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full text-sm font-medium mt-1">
                                                                B
                                                            </span>
                                                            <div 
                                                                className="text-gray-700"
                                                                dangerouslySetInnerHTML={{ __html: question.option_b }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    {(question.option_c || question.option_d) && (
                                                        <div className="space-y-2">
                                                            {question.option_c && (
                                                                <div className="flex items-start gap-3">
                                                                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full text-sm font-medium mt-1">
                                                                        C
                                                                    </span>
                                                                    <div 
                                                                        className="text-gray-700"
                                                                        dangerouslySetInnerHTML={{ __html: question.option_c }}
                                                                    ></div>
                                                                </div>
                                                            )}
                                                            {question.option_d && (
                                                                <div className="flex items-start gap-3">
                                                                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full text-sm font-medium mt-1">
                                                                        D
                                                                    </span>
                                                                    <div 
                                                                        className="text-gray-700"
                                                                        dangerouslySetInnerHTML={{ __html: question.option_d }}
                                                                    ></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500 ml-4">
                                                {new Date(question.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredQuestions.length)} of {filteredQuestions.length} questions
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                                                currentPage === 1
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                        >
                                            Previous
                                        </button>
                                        
                                        {[...Array(totalPages)].map((_, index) => (
                                            <button
                                                key={index + 1}
                                                onClick={() => setCurrentPage(index + 1)}
                                                className={`px-3 py-1 text-sm font-medium rounded-md ${
                                                    currentPage === index + 1
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                                }`}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}
                                        
                                        <button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                                                currentPage === totalPages
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default QuestionBank;