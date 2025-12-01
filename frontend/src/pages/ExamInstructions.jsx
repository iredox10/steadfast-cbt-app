import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import axios from "axios";
import { path } from "../../utils/path";
import { FaBook, FaClock, FaUser, FaGraduationCap, FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaShieldAlt, FaArrowRight, FaTimes } from "react-icons/fa";
import logo from "../../public/assets/buk.png"; // Import the logo

const ExamInstructions = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { data: examData } = useFetch(`/get-student-exam/${studentId}`);
    const { data: student } = useFetch(`/get-student/${studentId}`);

    const [course, setCourse] = useState(null);

    const fetchCourse = async () => {
        try {
            if (examData?.exam?.course_id) {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await axios.get(
                    `${path}/get-course/${examData.exam.course_id}`,
                    { headers }
                );
                setCourse(res.data);
            }
        } catch (error) {
            console.error("Error fetching course:", error);
        }
    };

    useEffect(() => {
        if (examData?.exam) {
            fetchCourse();
        }
    }, [examData]);

    // Convert seconds to minutes
    const durationInMinutes = examData?.exam?.exam_duration || 0;

    const handleStartExam = async () => {
        try {
            // Mark student as logged in
            await axios.post(`${path}/start-exam/${studentId}`);
            // Navigate to exam page
            navigate(`/student/${studentId}`);
        } catch (error) {
            console.error("Error starting exam:", error);
            // Optionally show an error message to the user
            alert("Failed to start exam. Please try again.");
        }
    };

    return (
        <div className="h-screen bg-gray-50 overflow-hidden flex flex-col md:flex-row font-sans">
            {/* Left Panel - Visual & Key Info */}
            <div className="w-full md:w-5/12 lg:w-1/3 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

                {/* Header / Logo */}
                <div className="relative z-10 flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                        <img src={logo} alt="BUK KANO Logo" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">BUK KANO</h1>
                        <p className="text-xs text-blue-200 uppercase tracking-wider">CBT Portal</p>
                    </div>
                </div>

                {/* Course & Student Info Card */}
                <div className="relative z-10 mb-auto">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-3 border border-blue-500/30">
                                Examination
                            </span>
                            <h2 className="text-2xl font-bold leading-tight mb-2">
                                {course?.title || "Loading Course..."}
                            </h2>
                            <p className="text-blue-200 text-sm">{course?.code || "..."}</p>
                        </div>

                        <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                            {student?.image ? (
                                <img
                                    src={`${path.replace('/api', '')}/${student.image}`}
                                    alt={student.full_name}
                                    className="w-10 h-10 rounded-full object-cover shadow-lg border border-white/20"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-400 flex items-center justify-center text-sm font-bold shadow-lg">
                                    {student?.full_name?.charAt(0) || "S"}
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-sm">{student?.full_name || "Loading..."}</p>
                                <p className="text-xs text-blue-200">{student?.candidate_no || "..."}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Stats Grid */}
                <div className="relative z-10 grid grid-cols-3 gap-4 mt-8">
                    <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm text-center border border-white/5">
                        <FaClock className="mx-auto mb-2 text-blue-300" />
                        <p className="text-2xl font-bold">{durationInMinutes}</p>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400">Minutes</p>
                    </div>
                    <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm text-center border border-white/5">
                        <FaBook className="mx-auto mb-2 text-purple-300" />
                        <p className="text-2xl font-bold">{examData?.questions?.length || 0}</p>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400">Questions</p>
                    </div>
                    <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm text-center border border-white/5">
                        <FaCheckCircle className="mx-auto mb-2 text-green-300" />
                        <p className="text-2xl font-bold">{examData?.exam?.marks_per_question || 0}</p>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400">Marks/Q</p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Instructions & Action */}
            <div className="flex-1 flex flex-col h-full relative bg-white">
                {/* Top Bar */}
                <div className="h-16 border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <FaInfoCircle className="text-blue-600" />
                        <span>Instructions</span>
                    </h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2 transition-colors"
                    >
                        <FaTimes /> Cancel
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-3xl mx-auto space-y-8">
                        {/* Specific Instructions */}
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-20"></div>
                            <h3 className="font-bold text-blue-900 mb-3 relative z-10">Exam-Specific Rules</h3>
                            <p className="text-blue-800 text-sm leading-relaxed whitespace-pre-line relative z-10">
                                {examData?.exam?.instructions || "No specific instructions provided. Follow standard examination protocols."}
                            </p>
                        </div>

                        {/* General Rules Grid */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-4">Standard Protocols</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { icon: FaClock, title: "Timed Exam", text: "Timer starts immediately. Auto-submits at zero.", color: "text-orange-500", bg: "bg-orange-50" },
                                    { icon: FaShieldAlt, title: "Monitored", text: "Fullscreen enforced. Tab switching logged.", color: "text-red-500", bg: "bg-red-50" },
                                    { icon: FaArrowRight, title: "Navigation", text: "Use buttons or keys to navigate questions.", color: "text-blue-500", bg: "bg-blue-50" },
                                    { icon: FaCheckCircle, title: "Submission", text: "Review all answers before final submission.", color: "text-green-500", bg: "bg-green-50" }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow bg-white">
                                        <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0 mr-3`}>
                                            <item.icon className={`${item.color}`} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security Warning */}
                        <div className="bg-red-50 border border-red-100 rounded-xl p-5 flex gap-4">
                            <div className="flex-shrink-0">
                                <FaExclamationTriangle className="text-red-500 text-xl" />
                            </div>
                            <div>
                                <h4 className="font-bold text-red-900 text-sm mb-1">Security Violation Policy</h4>
                                                                <p className="text-xs text-red-800 leading-relaxed">
                                                                    This exam is monitored. Violations such as exiting fullscreen, switching tabs, or using copy/paste will be logged. 
                                                                    <span className="font-bold"> {examData?.exam?.max_violations || 3} violations will result in automatic disqualification/submission.</span>
                                                                </p>                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="h-20 border-t border-gray-100 bg-white px-8 flex items-center justify-between flex-shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="hidden sm:block text-xs text-gray-500">
                        By starting, you agree to the <span className="underline cursor-pointer hover:text-gray-800">Terms of Examination</span>
                    </div>
                    <button
                        onClick={handleStartExam}
                        className="w-full sm:w-auto px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                        <span>Start Examination</span>
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamInstructions;
