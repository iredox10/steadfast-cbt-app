import React, { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaCheck, FaGraduationCap } from "react-icons/fa";

const StudentSubmission = () => {
    const navigate = useNavigate();
    const { studentId } = useParams();
    const location = useLocation();
    const submissionResult = location.state?.submissionResult;
    
    useEffect(() => {
        setTimeout(() => {
            navigate("/");
        }, 7000);
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                        <FaCheck className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Exam Submitted Successfully!
                    </h1>

                    {submissionResult?.show_result ? (
                        <div className="space-y-4 mb-6">
                            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                <h3 className="text-xl font-bold text-green-800 mb-2">Your Results:</h3>
                                <p className="text-gray-700 text-lg">Total Score: <span className="font-semibold">{submissionResult.total_score}</span></p>
                                <p className="text-gray-700 text-sm">Correct Answers: <span className="font-semibold">{submissionResult.correct_answers}</span></p>
                                <p className="text-gray-700 text-sm">Answered Questions: <span className="font-semibold">{submissionResult.answered_questions?.length}</span></p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <FaGraduationCap className="text-blue-600" />
                                    <span className="font-semibold text-blue-800">BUK KANO</span>
                                </div>
                                <p className="text-gray-700 text-sm">
                                    Your detailed results are displayed above.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50 rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <FaGraduationCap className="text-blue-600" />
                                <span className="font-semibold text-blue-800">BUK KANO</span>
                            </div>
                            <p className="text-gray-700 text-sm">
                                Your exam responses have been recorded successfully. Results will be released later.
                            </p>
                        </div>
                    )}
                    
                    <p className="text-gray-600 mb-6">
                        You will be automatically redirected to the home page in a few seconds.
                    </p>
                    <div className="animate-pulse inline-flex items-center gap-2 text-sm text-gray-500">
                        <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                        Redirecting to home page...
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSubmission;