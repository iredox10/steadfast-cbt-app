import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaArrowLeft } from 'react-icons/fa';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center">
                {/* 404 Illustration */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        404
                    </h1>
                    <div className="mt-4">
                        <svg className="w-64 h-64 mx-auto" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Lost person illustration */}
                            <circle cx="200" cy="150" r="80" fill="#E0E7FF" />
                            <circle cx="200" cy="130" r="40" fill="#6366F1" />
                            <path d="M180 160 Q200 180 220 160" stroke="#4F46E5" strokeWidth="3" fill="none" />
                            <circle cx="185" cy="120" r="5" fill="#1E293B" />
                            <circle cx="215" cy="120" r="5" fill="#1E293B" />
                            
                            {/* Question marks */}
                            <text x="100" y="100" fontSize="40" fill="#94A3B8" opacity="0.5">?</text>
                            <text x="280" y="100" fontSize="40" fill="#94A3B8" opacity="0.5">?</text>
                            <text x="140" y="220" fontSize="40" fill="#94A3B8" opacity="0.5">?</text>
                            <text x="240" y="220" fontSize="40" fill="#94A3B8" opacity="0.5">?</text>
                        </svg>
                    </div>
                </div>

                {/* Error Message */}
                <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-lg text-gray-600 mb-2">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <p className="text-gray-500">
                        Don't worry, it happens to the best of us!
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm"
                    >
                        <FaArrowLeft />
                        Go Back
                    </button>
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
                    >
                        <FaHome />
                        Go to Homepage
                    </Link>
                </div>

                {/* Helpful Links */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-gray-600 mb-4">Looking for something specific?</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link to="/admin-login" className="text-blue-600 hover:text-blue-700 hover:underline">
                            Admin Login
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link to="/" className="text-blue-600 hover:text-blue-700 hover:underline">
                            Student Portal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
