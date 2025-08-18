import { FaEye, FaPenToSquare, FaArrowLeft, FaPlus } from "react-icons/fa6";
import { Link, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { path } from "../../../utils/path";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import useFetch from "../../hooks/useFetch";

const CourseQuestions = () => {
    const { userId, courseId, examId } = useParams();
    const [showModel, setShowModel] = useState(false);
    const [question, setQuestion] = useState(null);
    const [showQuestionBank, setShowQuestionBank] = useState(false);
    const [questionBank, setQuestionBank] = useState([]);
    const [loading, setLoading] = useState(false);

    const {
        data: questions,
        loading: questionsLoading,
        err: questionsErr,
    } = useFetch(`/get-questions/${examId}`);

    const {
        data: exam,
        loading: examLoading,
        err: examErr,
    } = useFetch(`/get-exam-by-id/${examId}`);

    const {
        data: user,
        loading: userLoading,
        err: userErr,
    } = useFetch(`/get-user/${userId}`);

    const [course, setCourse] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            if (exam?.course_id) {
                try {
                    const res = await axios(`${path}/get-course/${exam.course_id}`);
                    setCourse(res.data);
                } catch (err) {
                    console.log(err);
                }
            }
        };
        fetchCourse();
    }, [exam]);

    const showQuestionDetail = async (questionId) => {
        setShowModel(true);
        try {
            const res = await axios(`${path}/get-question/${questionId}`);
            setQuestion(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchQuestionBank = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${path}/question-bank/${userId}/${courseId}`);
            setQuestionBank(res.data);
            setShowQuestionBank(true);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const populateQuestionFromBank = async (bankQuestion, questionId) => {
        try {
            setLoading(true);
            await axios.patch(`${path}/edit-question/${questionId}`, {
                question: bankQuestion.question,
                correct_answer: bankQuestion.correct_answer,
                option_b: bankQuestion.option_b,
                option_c: bankQuestion.option_c,
                option_d: bankQuestion.option_d
            });
            // Refresh questions after populating
            window.location.reload();
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

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
                    <span>All Courses</span>
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
                        <h2 className="text-xl font-bold text-gray-900">Exam Questions</h2>
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
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Question Bank</h2>
                            <button 
                                onClick={() => setShowQuestionBank(false)}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {questionBank.map((bankQuestion) => (
                                        <div key={bankQuestion.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                            <div className="mb-3">
                                                <h3 className="font-medium text-gray-900 mb-2">Question:</h3>
                                                <div 
                                                    className="text-gray-800"
                                                    dangerouslySetInnerHTML={{__html: bankQuestion.question}} 
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                                                    <strong className="text-green-800">Correct Answer:</strong>
                                                    <div 
                                                        className="mt-1 text-green-700"
                                                        dangerouslySetInnerHTML={{__html: bankQuestion.correct_answer}} 
                                                    />
                                                </div>
                                                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                                    <strong className="text-gray-800">Option B:</strong>
                                                    <div 
                                                        className="mt-1 text-gray-700"
                                                        dangerouslySetInnerHTML={{__html: bankQuestion.option_b}} 
                                                    />
                                                </div>
                                                {bankQuestion.option_c && (
                                                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                                        <strong className="text-gray-800">Option C:</strong>
                                                        <div 
                                                            className="mt-1 text-gray-700"
                                                            dangerouslySetInnerHTML={{__html: bankQuestion.option_c}} 
                                                        />
                                                    </div>
                                                )}
                                                {bankQuestion.option_d && (
                                                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                                        <strong className="text-gray-800">Option D:</strong>
                                                        <div 
                                                            className="mt-1 text-gray-700"
                                                            dangerouslySetInnerHTML={{__html: bankQuestion.option_d}} 
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                {questions && questions.map((q) => !q.question && (
                                                    <button
                                                        key={q.id}
                                                        onClick={() => populateQuestionFromBank(bankQuestion, q.id)}
                                                        disabled={loading}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:opacity-50"
                                                    >
                                                        Use for Question {q.serial_number}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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