import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaTrophy, FaHome, FaPrint } from "react-icons/fa";
import logo from "../../public/assets/buk.png";

const StudentResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;

    // Redirect to home if no result data is present (e.g., direct access)
    useEffect(() => {
        if (!result) {
            navigate("/");
        }
    }, [result, navigate]);

    if (!result) return null;

    const {
        total_score,
        correct_answers,
        answered_questions = [],
        score_record,
        course_name // Added this fallback
    } = result;

    // Prevent back button navigation
    useEffect(() => {
        window.history.pushState(null, document.title, window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, document.title, window.location.href);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // Calculate percentage if not provided
    // ... (comments)

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                            <img src={logo} alt="BUK Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">BUK KANO</h1>
                            <p className="text-xs text-gray-600">Examination Result Slip</p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaPrint /> Print
                    </button>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
                <div className="w-full max-w-2xl">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        {/* Score Banner */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>

                            <div className="relative z-10">
                                <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 shadow-lg">
                                    <FaTrophy className="text-4xl text-yellow-300" />
                                </div>
                                <h2 className="text-3xl font-bold mb-1">Examination Completed</h2>
                                <p className="text-blue-100 text-sm uppercase tracking-wider">{score_record?.course_name || course_name || 'Course Exam'}</p>

                                <div className="mt-8 mb-4">
                                    <span className="text-6xl font-extrabold tracking-tight">{total_score}</span>
                                    <span className="text-2xl text-blue-200 font-medium"> marks</span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Stats */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                                    <FaCheckCircle className="text-green-500 text-2xl mx-auto mb-2" />
                                    <p className="text-gray-500 text-xs uppercase tracking-wide">Correct</p>
                                    <p className="text-2xl font-bold text-green-700">{correct_answers}</p>
                                </div>

                                {/* Note: We might not have 'wrong' count directly if we don't know total questions here.
                                    If 'answered_questions' is the list of ALL attempts, we can derive it.
                                    If we just rely on the data passed: */}
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                                    <FaQuestionCircle className="text-blue-500 text-2xl mx-auto mb-2" />
                                    <p className="text-gray-500 text-xs uppercase tracking-wide">Answered</p>
                                    <p className="text-2xl font-bold text-blue-700">{answered_questions?.length || 0}</p>
                                </div>

                                <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-center">
                                    <FaTimesCircle className="text-red-500 text-2xl mx-auto mb-2" />
                                    <p className="text-gray-500 text-xs uppercase tracking-wide">Incorrect</p>
                                    <p className="text-2xl font-bold text-red-700">{(answered_questions?.length || 0) - correct_answers}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-8 text-center">
                                <p className="text-gray-600 mb-6">
                                    Your result has been saved. You can print this page for your records.
                                </p>
                                <button
                                    onClick={() => navigate('/', { replace: true })}
                                    className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
                                >
                                    <FaHome className="mr-2" />
                                    Return to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentResult;
