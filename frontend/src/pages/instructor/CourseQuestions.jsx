import { FaEye, FaPenToSquare, FaArrowLeft, FaPlus } from "react-icons/fa6";
import { Link, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { path } from "../../../utils/path";
import { FaTimes, FaTachometerAlt, FaBook } from "react-icons/fa";
import axios from "axios";

const CourseQuestions = () => {
    const { userId, courseId, examId } = useParams();
    const [showModel, setShowModel] = useState(false);
    const [question, setQuestion] = useState(null);
    const [showQuestionBank, setShowQuestionBank] = useState(false);
    const [questionBank, setQuestionBank] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State for data that was previously fetched by useFetch
    const [questions, setQuestions] = useState([]);
    const [questionsLoading, setQuestionsLoading] = useState(true);
    const [questionsErr, setQuestionsErr] = useState(null);
    
    const [exam, setExam] = useState(null);
    const [examLoading, setExamLoading] = useState(true);
    const [examErr, setExamErr] = useState(null);
    
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [userErr, setUserErr] = useState(null);
    
    const [course, setCourse] = useState(null);

    // Pagination state for Question Bank
    const [bankPage, setBankPage] = useState(1);
    const [bankSearchTerm, setBankSearchTerm] = useState("");
    const questionsPerBankPage = 10;

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Fetch questions with authentication
    const fetchQuestions = async () => {
        try {
            setQuestionsLoading(true);
            const headers = getAuthHeaders();
            const res = await axios.get(`${path}/get-questions/${examId}`, { headers });
            setQuestions(res.data);
            setQuestionsErr(null);
        } catch (err) {
            console.error("Error fetching questions:", err);
            if (err.response?.status === 401) {
                setQuestionsErr("Authentication failed. Please log in again.");
            } else {
                setQuestionsErr(err.response?.data?.message || "Error loading questions");
            }
        } finally {
            setQuestionsLoading(false);
        }
    };

    // Fetch exam with authentication
    const fetchExam = async () => {
        try {
            setExamLoading(true);
            const headers = getAuthHeaders();
            const res = await axios.get(`${path}/get-exam-by-id/${examId}`, { headers });
            setExam(res.data);
            setExamErr(null);
        } catch (err) {
            console.error("Error fetching exam:", err);
            if (err.response?.status === 401) {
                setExamErr("Authentication failed. Please log in again.");
            } else {
                setExamErr(err.response?.data?.message || "Error loading exam");
            }
        } finally {
            setExamLoading(false);
        }
    };

    // Fetch user with authentication
    const fetchUser = async () => {
        try {
            setUserLoading(true);
            const headers = getAuthHeaders();
            const res = await axios.get(`${path}/get-user/${userId}`, { headers });
            setUser(res.data);
            setUserErr(null);
        } catch (err) {
            console.error("Error fetching user:", err);
            if (err.response?.status === 401) {
                setUserErr("Authentication failed. Please log in again.");
            } else {
                setUserErr(err.response?.data?.message || "Error loading user");
            }
        } finally {
            setUserLoading(false);
        }
    };

    // Initial data fetching
    useEffect(() => {
        if (examId && userId) {
            fetchQuestions();
            fetchExam();
            fetchUser();
        }
    }, [examId, userId]);

    useEffect(() => {
        const fetchCourse = async () => {
            if (exam?.course_id) {
                try {
                    const headers = getAuthHeaders();
                    const res = await axios.get(`${path}/get-course/${exam.course_id}`, { headers });
                    setCourse(res.data);
                } catch (err) {
                    console.error("Error fetching course:", err);
                }
            }
        };
        fetchCourse();
    }, [exam]);

    const showQuestionDetail = async (questionId) => {
        setShowModel(true);
        try {
            const headers = getAuthHeaders();
            const res = await axios.get(`${path}/get-question/${questionId}`, { headers });
            setQuestion(res.data);
        } catch (err) {
            console.error("Error fetching question details:", err);
            if (err.response?.status === 401) {
                console.error("Authentication failed");
            }
        }
    };

    const fetchQuestionBank = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            const res = await axios.get(`${path}/question-bank/${userId}/${courseId}`, { headers });
            setQuestionBank(res.data);
            setShowQuestionBank(true);
        } catch (err) {
            console.error("Error fetching question bank:", err);
            if (err.response?.status === 401) {
                console.error("Authentication failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const populateQuestionFromBank = async (bankQuestion, questionId) => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            await axios.patch(`${path}/edit-question/${questionId}`, {
                question: bankQuestion.question,
                correct_answer: bankQuestion.correct_answer,
                option_a: bankQuestion.option_a || bankQuestion.correct_answer,
                option_b: bankQuestion.option_b,
                option_c: bankQuestion.option_c,
                option_d: bankQuestion.option_d
            }, { headers });
            // Refresh questions after populating
            fetchQuestions();
            setShowQuestionBank(false);
        } catch (err) {
            console.error("Error populating question from bank:", err);
            if (err.response?.status === 401) {
                console.error("Authentication failed");
            }
        } finally {
            setLoading(false);
        }
    };

    // Filter and paginate question bank
    const filteredBankQuestions = questionBank.filter(q => 
        q.question.toLowerCase().includes(bankSearchTerm.toLowerCase()) ||
        q.correct_answer.toLowerCase().includes(bankSearchTerm.toLowerCase())
    );

    const paginatedBankQuestions = filteredBankQuestions.slice(
        (bankPage - 1) * questionsPerBankPage,
        bankPage * questionsPerBankPage
    );

    const totalBankPages = Math.ceil(filteredBankQuestions.length / questionsPerBankPage);

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <Sidebar>
                <Link
                    to={`/instructor/dashboard/${userId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaTachometerAlt />
                    <span>Dashboard</span>
                </Link>
                <Link
                    to={`/instructor/${userId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaBook />
                    <span>Courses</span>
                </Link>
            </Sidebar>
            
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            {course ? course.title : "Course"} Questions
                        </h1>
                        <p className="text-gray-600">
                            Manage and review exam questions
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to={`/exams/${userId}/${courseId}`}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            <FaArrowLeft />
                            <span>Back to Exams</span>
                        </Link>
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Exam Questions</h2>
                            {exam && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Pool Size: <span className="font-semibold text-blue-600">{questions.length}</span> | 
                                    Students Answer: <span className="font-semibold text-green-600">{exam.actual_questions}</span>
                                </p>
                            )}
                        </div>
                        <button
                            onClick={fetchQuestionBank}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
                        >
                            {loading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fas fa-book"></i>
                            )}
                            <span>Open Question Bank</span>
                        </button>
                    </div>
                    
                    {questionsLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : questionsErr ? (
                        <div className="text-center py-8">
                            <i className="fas fa-exclamation-triangle text-yellow-500 text-2xl mb-2"></i>
                            <p className="text-gray-600">Error loading questions</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-10 gap-3">
                            {questions && questions.map((q) => (
                                <div key={q.id} className="relative">
                                    {!q.question ? (
                                        <Link
                                            to={`/add-question/${q.id}/${userId}/${courseId}/${examId}`}
                                            className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
                                        >
                                            <span className="text-gray-600 hover:text-blue-600 font-medium">
                                                {q.serial_number}
                                            </span>
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => showQuestionDetail(q.id)}
                                            className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                                        >
                                            {q.serial_number}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Question Bank Modal */}
            {showQuestionBank && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
                        <div className="flex flex-col p-6 border-b border-gray-100 gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Question Bank ({filteredBankQuestions.length})</h2>
                                <button 
                                    onClick={() => setShowQuestionBank(false)}
                                    className="text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Search questions..."
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={bankSearchTerm}
                                onChange={(e) => {
                                    setBankSearchTerm(e.target.value);
                                    setBankPage(1);
                                }}
                            />
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
                            {loading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {paginatedBankQuestions.map((bankQuestion) => (
                                        <div key={bankQuestion.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                                            <div className="mb-3">
                                                <h3 className="font-medium text-gray-900 mb-2">Question:</h3>
                                                <div 
                                                    className="text-gray-800 prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{__html: bankQuestion.question}} 
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                                                    <strong className="text-green-800 text-sm">Correct Answer:</strong>
                                                    <div 
                                                        className="mt-1 text-green-700 text-sm"
                                                        dangerouslySetInnerHTML={{__html: bankQuestion.correct_answer}} 
                                                    />
                                                </div>
                                                {/* Simplified options display for compactness */}
                                                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                                    <strong className="text-gray-800 text-sm">Other Options:</strong>
                                                    <div className="mt-1 text-gray-600 text-xs space-y-1">
                                                        <div className="truncate" title="Option B" dangerouslySetInnerHTML={{__html: `B: ${bankQuestion.option_b}`}} />
                                                        {bankQuestion.option_c && <div className="truncate" title="Option C" dangerouslySetInnerHTML={{__html: `C: ${bankQuestion.option_c}`}} />}
                                                        {bankQuestion.option_d && <div className="truncate" title="Option D" dangerouslySetInnerHTML={{__html: `D: ${bankQuestion.option_d}`}} />}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                                                {questions && questions.filter(q => !q.question).slice(0, 3).map((q) => (
                                                    <button
                                                        key={q.id}
                                                        onClick={() => populateQuestionFromBank(bankQuestion, q.id)}
                                                        disabled={loading}
                                                        className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-medium transition-colors"
                                                    >
                                                        Fill Q{q.serial_number}
                                                    </button>
                                                ))}
                                                {questions && questions.filter(q => !q.question).length > 3 && (
                                                    <span className="text-xs text-gray-400 self-center ml-1">...and more</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {paginatedBankQuestions.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            No questions found matching your search.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pagination Footer */}
                        <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                Page {bankPage} of {totalBankPages || 1}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setBankPage(p => Math.max(1, p - 1))}
                                    disabled={bankPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setBankPage(p => Math.min(totalBankPages, p + 1))}
                                    disabled={bankPage === totalBankPages || totalBankPages === 0}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Question Detail Modal */}
            {showModel && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    {question ? (
                        <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Question Details</h2>
                                <button 
                                    onClick={() => setShowModel(false)}
                                    className="text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Question</h3>
                                        <div 
                                            className="p-4 bg-gray-50 rounded-lg text-gray-800"
                                            dangerouslySetInnerHTML={{__html: question.question}}
                                        />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Correct Answer</h3>
                                        <div 
                                            className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-800"
                                            dangerouslySetInnerHTML={{__html: question.correct_answer}}
                                        />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Options</h3>
                                        <div className="space-y-2">
                                            {['a', 'b', 'c', 'd'].map((option) => (
                                                <div
                                                    key={option}
                                                    className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-800"
                                                >
                                                    <strong className="capitalize">Option {option}:</strong>
                                                    <div 
                                                        className="mt-1"
                                                        dangerouslySetInnerHTML={{__html: question[`option_${option}`]}}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between p-6 border-t border-gray-100">
                                <button
                                    onClick={() => setShowModel(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                                <Link
                                    to={`/edit-question/${userId}/${question.id}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <FaPenToSquare className="w-4 h-4" />
                                    <span>Edit Question</span>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading question details...</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseQuestions;
