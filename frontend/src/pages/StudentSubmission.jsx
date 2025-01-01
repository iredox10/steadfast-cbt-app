import React, { useEffect } from "react";
import FormBtn from "../components/FormBtn";
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";

const StudentSubmission = () => {
    const navigate = useNavigate();
    useEffect(() => {
        setTimeout(() => {
            navigate("/");
        }, 7000);
    }, []);
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                        <FaCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Exam Submitted Successfully!
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Your exam has been received. You will be redirected to the home page shortly.
                    </p>
                    <div className="animate-pulse inline-flex items-center gap-2 text-sm text-gray-500">
                        <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                        Redirecting...
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSubmission;
