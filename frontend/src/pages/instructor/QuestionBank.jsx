import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { path } from "../../../utils/path";
import GridLayout from "../../components/GridLayout";
import Sidebar from "../../components/Sidebar";
import { format } from 'date-fns';

const QuestionBank = () => {
    const { userId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedExam, setSelectedExam] = useState("all");

    useEffect(() => {
        fetchQuestions();
    }, [userId, selectedExam]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const endpoint = selectedExam === "all" 
                ? `${path}/question-bank/${userId}/${courseId}`
                : `${path}/question-bank/${userId}/${selectedExam}`;
            const response = await axios.get(endpoint);
            setQuestions(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch questions");
        } finally {
            setLoading(false);
        }
    };

    // Filter questions based on search term
    const filteredQuestions = questions.filter(question =>
        question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.exam?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentQuestions = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

    return (
        <GridLayout>
            <Sidebar>
                {/* Add sidebar navigation items if needed */}
            </Sidebar>
            <div className="col-span-5 p-8 bg-gray-50">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Question Bank</h1>
                    <p className="text-gray-600">Manage and reuse your exam questions</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    {/* Search and Filter Controls */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search questions..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions List */}
                    {loading ? (
                        <div className="p-8 text-center">
                            <i className="fas fa-spinner fa-spin text-blue-500 text-2xl"></i>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {currentQuestions.map((question, index) => (
                                <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm font-medium text-gray-500">
                                                    Question {indexOfFirstItem + index + 1}
                                                </span>
                                                {question.exam && (
                                                    <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                                                        {question.exam.title}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-900 font-medium mb-4">{question.question}</p>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                            ✓
                                                        </span>
                                                        <span className="text-gray-700">{question.correct_answer}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                                            B
                                                        </span>
                                                        <span className="text-gray-700">{question.option_b}</span>
                                                    </div>
                                                </div>
                                                {(question.option_c || question.option_d) && (
                                                    <div className="space-y-2">
                                                        {question.option_c && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                                                    C
                                                                </span>
                                                                <span className="text-gray-700">{question.option_c}</span>
                                                            </div>
                                                        )}
                                                        {question.option_d && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                                                    D
                                                                </span>
                                                                <span className="text-gray-700">{question.option_d}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {format(new Date(question.created_at), 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && !error && filteredQuestions.length > 0 && (
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
                                                    ? 'bg-blue-600 text-white'
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
                    )}
                </div>
            </div>
        </GridLayout>
    );
};

export default QuestionBank; 