import React from "react";
import { FaExclamationTriangle, FaUserCheck, FaInfoCircle } from "react-icons/fa";
import logo from "../../public/assets/buk.png";

const NotCheckIn = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <img
                            src={logo}
                            className="w-10 h-10 object-contain"
                            alt="HUK POLY Logo"
                        />
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">BUK KANO</h1>
                            <p className="text-xs text-gray-600">Computer Based Test Portal</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <FaExclamationTriangle className="text-white text-2xl" />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold text-white">Check-In Required</h1>
                                <p className="text-yellow-100 mt-1">Exam Access Restricted</p>
                            </div>

                            {/* Card Body */}
                            <div className="p-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                        You Must Be Checked In By An Invigilator
                                    </h2>
                                    <p className="text-gray-600 text-lg">
                                        Before you can access your exam, you must be checked in by an authorized invigilator.
                                    </p>
                                </div>

                                {/* Instructions */}
                                <div className="bg-yellow-50 rounded-xl p-6 mb-8 border border-yellow-200">
                                    <h3 className="font-bold text-yellow-800 text-lg mb-4 flex items-center justify-center">
                                        <FaInfoCircle className="mr-2" />
                                        What You Need To Do
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-4 flex-shrink-0">
                                                <span className="text-yellow-800 font-bold text-sm">1</span>
                                            </div>
                                            <p className="text-yellow-700">
                                                Locate your assigned invigilator in the examination hall
                                            </p>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-4 flex-shrink-0">
                                                <span className="text-yellow-800 font-bold text-sm">2</span>
                                            </div>
                                            <p className="text-yellow-700">
                                                Present your identification to the invigilator for verification
                                            </p>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-4 flex-shrink-0">
                                                <span className="text-yellow-800 font-bold text-sm">3</span>
                                            </div>
                                            <p className="text-yellow-700">
                                                Present the ticket number you were issued before the exam so the invigilator can verify and check you in
                                            </p>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-4 flex-shrink-0">
                                                <span className="text-yellow-800 font-bold text-sm">4</span>
                                            </div>
                                            <p className="text-yellow-700">
                                                Use your candidate number and ticket number to log in to the exam
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Check-in Status */}
                                <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
                                    <h3 className="font-bold text-blue-800 text-lg mb-4 flex items-center justify-center">
                                        <FaUserCheck className="mr-2" />
                                        Check Your Status
                                    </h3>
                                    <p className="text-blue-700 text-center mb-4">
                                        After being checked in by your invigilator, you can try logging in again.
                                    </p>
                                    <div className="text-center">
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition flex items-center justify-center mx-auto shadow-lg"
                                        >
                                            Try Login Again
                                        </button>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="text-center text-gray-500 text-sm mb-6">
                                    <p>
                                        If you're having trouble, please contact the examination administrator.
                                    </p>
                                </div>
                                
                                {/* Ticket System Info */}
                                <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                                    <h4 className="font-bold text-blue-800 mb-2 text-center">Ticket-Based Access System</h4>
                                    <p className="text-blue-700 text-sm text-center">
                                        For security purposes, each student receives a ticket number in advance. Bring this ticket to the hall, 
                                        and an authorized invigilator will verify it before you can access the exam.
                                    </p>
                                </div>

                                <div className="text-center">
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                                    >
                                        Try Logging In Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} BUK KANO. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default NotCheckIn;
