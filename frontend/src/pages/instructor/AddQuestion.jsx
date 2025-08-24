import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../quill.css";
import { FaPlus, FaTimes, FaBook, FaSave, FaArrowLeft } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { path } from "../../../utils/path";

const AddQuestion = () => {
    const { questionId, userId, courseId, examId } = useParams();
    
    // State for user data that was previously fetched by useFetch
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [userError, setUserError] = useState(null);

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Fetch user with authentication
    const fetchUser = async () => {
        try {
            setUserLoading(true);
            const headers = getAuthHeaders();
            const res = await axios.get(`${path}/get-user/${userId}`, { headers });
            setUser(res.data);
            setUserError(null);
        } catch (err) {
            console.error("Error fetching user:", err);
            if (err.response?.status === 401) {
                setUserError("Authentication failed. Please log in again.");
            } else {
                setUserError(err.response?.data?.message || "Error loading user");
            }
        } finally {
            setUserLoading(false);
        }
    };

    // Initial data fetching
    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [userId]);

    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            [{ color: [] }, { background: [] }],
            ["clean"],
            ["blockquote", "code-block"],
        ],
    };

    const navigate = useNavigate();

    const [question, setQuestion] = useState("");
    const [optionEditor, setOptionEditor] = useState("");
    const [options, setOptions] = useState([]);

    const [error, setError] = useState("");
    const [showQuestionBank, setShowQuestionBank] = useState(false);
    const [questionBank, setQuestionBank] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle changes for each editor
    const handleQuestionChange = (content) => {
        setQuestion(content);
    };

    const handleAnswerChange = (content) => {
        // Update the first option as the correct answer
        if (options.length > 0) {
            const newOptions = [...options];
            newOptions[0] = content;
            setOptions(newOptions);
        } else {
            setOptions([content]);
        }
    };

    const handleOptionEditor = (content) => {
        setOptionEditor(content);
    };

    const addOption = () => {
        if (optionEditor === "") {
            setError("Option can't be empty");
            return;
        }
        if (options.length >= 4) {
            setError("You can't add more than 4 options");
            return;
        }
        setOptions((prev) => [...prev, optionEditor]);
        setOptionEditor("");
    };

    const removeOption = (i) => {
        const newValue = options.filter((option, index) => index !== i);
        setOptions(newValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question) {
            setError("Question is required");
            return;
        }
        if (options.length < 2) {
            setError("Minimum 2 options are required");
            return;
        }
        if (options.length > 4) {
            setError("Maximum 4 options are allowed");
            return;
        }
        setError("");
        
        // Use the first option as the correct answer
        const correctAnswer = options[0];
        
        // Map options to the required format, including option_a
        const optionMap = {
            option_a: options[0] || "", // The correct answer is also option_a
            option_b: options[1] || "",
            option_c: options[2] || "",
            option_d: options[3] || ""
        };

        try {
            setLoading(true);
            const headers = getAuthHeaders();
            const res = await axios.post(
                `${path}/add-question/${questionId}/${userId}/${courseId}/${examId}`,
                {
                    user_id: userId,
                    exam_id: examId,
                    question,
                    correct_answer: correctAnswer,
                    ...optionMap
                },
                { headers }
            );
            if (res.status === 201) {
                navigate(-1);
            }
        } catch (err) {
            console.error("Error creating question:", err);
            if (err.response?.status === 401) {
                setError("Authentication failed. Please log in again.");
            } else {
                setError(err.response?.data?.message || "Error creating question");
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch question bank when needed
    const fetchQuestionBank = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            const response = await axios.get(
                `${path}/question-bank/${userId}/${courseId}`,
                { headers }
            );
            setQuestionBank(response.data);
            setShowQuestionBank(true);
        } catch (error) {
            console.error("Error fetching question bank:", error);
            if (error.response?.status === 401) {
                setError("Authentication failed. Please log in again.");
            } else {
                setError(error.response?.data?.message || "Error fetching question bank");
            }
        } finally {
            setLoading(false);
        }
    };

    // Filter questions based on search term
    const filteredQuestions = questionBank.filter((q) =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Function to populate form with selected question
    const populateQuestion = (question) => {
        setQuestion(question.question);
        setOptions([
            question.correct_answer,
            question.option_b,
            question.option_c,
            question.option_d
        ].filter(Boolean)); // Remove any null/undefined/empty options
        setShowQuestionBank(false);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <Sidebar>
                <Link
                    to={`/exam-questions/${userId}/${courseId}/${examId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaArrowLeft />
                    <span>Back to Questions</span>
                </Link>
                <Link
                    to={`/exams/${userId}/${courseId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaBook />
                    <span>Exams</span>
                </Link>
            </Sidebar>
            
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Add Question
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Create a new question for your exam
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <i className="fas fa-user text-blue-600"></i>
                            </div>
                            <span className="font-medium text-gray-900">{user?.full_name || 'Instructor'}</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Question Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            {error && (
                                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded mb-6">
                                    <p>{typeof error === 'object' ? error.error || error.message || 'An error occurred' : error}</p>
                                </div>
                            )}

                            <div className="mb-6">
                                <button
                                    type="button"
                                    onClick={fetchQuestionBank}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                >
                                    <FaBook />
                                    <span>Select from Question Bank</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Question Text
                                    </label>
                                    <div className="border border-gray-200 rounded-lg">
                                        <ReactQuill
                                            value={question}
                                            onChange={handleQuestionChange}
                                            theme="snow"
                                            modules={modules}
                                            className="min-h-[200px]"
                                            placeholder="Enter your question here..."
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Answer Options
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addOption}
                                            disabled={options.length >= 4 || loading}
                                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                        >
                                            <FaPlus />
                                            <span>Add Option</span>
                                        </button>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg">
                                        <ReactQuill
                                            value={optionEditor}
                                            onChange={handleOptionEditor}
                                            theme="snow"
                                            modules={modules}
                                            className="min-h-[150px]"
                                            placeholder="Enter an answer option..."
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaSave />
                                                <span>Save Question</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <i className="fas fa-user text-blue-600"></i>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">
                                        {user?.full_name || 'Instructor'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Instructor
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(-1)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <FaArrowLeft />
                                <span>Back</span>
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                    Correct Answer
                                </h2>
                                <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                                    {options && options.length > 0 ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: options[0],
                                            }}
                                        ></div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">
                                            No correct answer selected yet
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Answer Options
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Options for this question (min: 2, max: 4)
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                        options.length < 2 ? 'bg-red-100 text-red-800' :
                                        options.length > 4 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {options?.length || 0} options
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {options && options.map((option, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                                        >
                                            <div
                                                className="flex-1 mr-4 break-words overflow-auto max-h-32"
                                                dangerouslySetInnerHTML={{
                                                    __html: option,
                                                }}
                                            />
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => removeOption(i)}
                                                    disabled={loading}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Remove option"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Bank Modal */}
                {showQuestionBank && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Question Bank
                                </h2>
                                <button
                                    onClick={() => setShowQuestionBank(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="relative mb-4">
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

                            <div className="flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="p-8 text-center">
                                        <i className="fas fa-spinner fa-spin text-blue-500 text-2xl"></i>
                                    </div>
                                ) : filteredQuestions.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No questions found
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {filteredQuestions.map((q) => (
                                            <div
                                                key={q.id}
                                                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => populateQuestion(q)}
                                            >
                                                <div
                                                    className="font-medium text-gray-900 mb-4"
                                                    dangerouslySetInnerHTML={{
                                                        __html: q.question,
                                                    }}
                                                ></div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-start gap-2">
                                                            <span className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-sm font-medium mt-1">
                                                                ✓
                                                            </span>
                                                            <div
                                                                dangerouslySetInnerHTML={{
                                                                    __html: q.correct_answer,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <div className="flex items-start gap-2">
                                                            <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full text-sm font-medium mt-1">
                                                                B
                                                            </span>
                                                            <div
                                                                dangerouslySetInnerHTML={{
                                                                    __html: q.option_b,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    {(q.option_c || q.option_d) && (
                                                        <div className="space-y-2">
                                                            {q.option_c && (
                                                                <div className="flex items-start gap-2">
                                                                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full text-sm font-medium mt-1">
                                                                        C
                                                                    </span>
                                                                    <div
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: q.option_c,
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                            )}
                                                            {q.option_d && (
                                                                <div className="flex items-start gap-2">
                                                                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full text-sm font-medium mt-1">
                                                                        D
                                                                    </span>
                                                                    <div
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: q.option_d,
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AddQuestion;