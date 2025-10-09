import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import axios from "axios";
import { path } from "../../utils/path";
import { FaBook, FaClock, FaUser, FaGraduationCap, FaCheckCircle, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

const ExamInstructions = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { data: examData } = useFetch(`/get-student-exam`);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                            <FaGraduationCap className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">BUK KANO</h1>
                            <p className="text-xs text-gray-600">Computer Based Test Portal</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition flex items-center"
                    >
                        <FaInfoCircle className="mr-2" />
                        <span className="hidden sm:inline">Go Back</span>
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Page Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Exam Instructions
                        </h1>
                        <p className="text-gray-600">
                            Please read all instructions carefully before proceeding
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
                            <h2 className="text-2xl font-bold text-white flex items-center">
                                <FaInfoCircle className="mr-3" />
                                Important Exam Information
                            </h2>
                        </div>

                        <div className="p-6">
                            {/* Student Info */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
                                <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                                    <FaUser className="mr-2 text-blue-600" />
                                    Student Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                            <span className="text-blue-600 font-bold text-sm">
                                                {student?.full_name?.charAt(0) || 'S'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Name</p>
                                            <p className="font-medium text-gray-800 capitalize">{student?.full_name || 'Loading...'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                            <FaUser className="text-blue-600 text-sm" />
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Student ID</p>
                                            <p className="font-medium text-gray-800">{student?.candidate_no || 'Loading...'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                            <FaBook className="text-blue-600 text-sm" />
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Course</p>
                                            <p className="font-medium text-gray-800">{course?.title || 'Loading...'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                            <FaClock className="text-blue-600 text-sm" />
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Duration</p>
                                            <p className="font-medium text-gray-800">{durationInMinutes} minutes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Exam Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                            <span className="text-blue-600 font-bold">
                                                {examData?.questions?.length || 0}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-800">Questions</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Total number of questions in this exam
                                    </p>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                            <span className="text-green-600 font-bold">
                                                {examData?.exam?.marks_per_question || 0}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-800">Marks/Question</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Marks awarded for each correct answer
                                    </p>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                            <FaClock className="text-purple-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-800">Timer</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Starts immediately when you begin the exam
                                    </p>
                                </div>
                            </div>

                            {/* Specific Instructions */}
                            <div className="mb-8">
                                <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                                    <FaInfoCircle className="mr-2 text-blue-600" />
                                    Exam-Specific Instructions
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                    {examData?.exam?.instructions ? (
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {examData.exam.instructions}
                                        </p>
                                    ) : (
                                        <p className="text-gray-500 italic">
                                            No specific instructions provided for this exam.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* General Instructions */}
                            <div className="mb-8">
                                <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                                    <FaCheckCircle className="mr-2 text-green-600" />
                                    General Exam Instructions
                                </h3>
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <ul className="divide-y divide-gray-100">
                                        <li className="p-4 flex items-start">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                                <span className="text-blue-600 text-xs">1</span>
                                            </div>
                                            <p className="text-gray-700">
                                                The exam timer will start as soon as you click "Start Exam" and cannot be paused.
                                            </p>
                                        </li>



                                        <li className="p-4 flex items-start">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                                <span className="text-blue-600 text-xs">2</span>
                                            </div>
                                            <p className="text-gray-700">
                                                Your exam will be automatically submitted when the timer reaches zero.
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Declaration */}
                            <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200 mb-8">
                                <div className="flex">
                                    <FaExclamationTriangle className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-yellow-800 mb-2">Important Declaration</h3>
                                        <p className="text-yellow-700 text-sm">
                                            By clicking "Start Exam", you confirm that you have read and understood all instructions,
                                            and agree to comply with the examination rules. Any violation of exam rules may result in
                                            disqualification.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end gap-4">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleStartExam}
                                    className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition flex items-center justify-center shadow-lg"
                                >
                                    Start Exam
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8 mt-12">
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

export default ExamInstructions;
