import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import axios from "axios";
import { path } from "../../utils/path";
import { FaClock, FaUser, FaGraduationCap, FaInfoCircle, FaPlay, FaRegClock, FaCalendarAlt, FaSync } from "react-icons/fa";
import logo from "../../public/assets/buk.png";

const WaitingRoom = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { data: examData, refetch } = useFetch(`/get-student-exam/${studentId}`);
    const { data: student } = useFetch(`/get-student/${studentId}`);

    const [course, setCourse] = useState(null);
    const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isReady, setIsReady] = useState(false);

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

    useEffect(() => {
        if (!examData?.exam) return;

        const timerMode = examData.exam.timer_mode;
        const timerStartType = examData.exam.timer_start_type;
        const scheduledStartTime = examData.exam.scheduled_start_time;
        const activatedDate = examData.exam.activated_date;

        if (timerMode === 'global') {
            if (timerStartType === 'manual' && !activatedDate) {
                setIsReady(false);
            } else if (timerStartType === 'scheduled' && scheduledStartTime) {
                const scheduled = new Date(scheduledStartTime).getTime();
                const now = Date.now();
                if (now < scheduled) {
                    setIsReady(false);
                } else {
                    setIsReady(true);
                }
            } else if (activatedDate) {
                setIsReady(true);
            }
        } else {
            setIsReady(true);
        }
    }, [examData]);

    useEffect(() => {
        if (!examData?.exam || isReady) return;

        const timerStartType = examData.exam.timer_start_type;
        const scheduledStartTime = examData.exam.scheduled_start_time;

        if (timerStartType === 'scheduled' && scheduledStartTime) {
            const interval = setInterval(() => {
                const scheduled = new Date(scheduledStartTime).getTime();
                const now = Date.now();
                const diff = scheduled - now;

                if (diff <= 0) {
                    setCountdown({ hours: 0, minutes: 0, seconds: 0 });
                    setIsReady(true);
                    clearInterval(interval);
                } else {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    setCountdown({ hours, minutes, seconds });
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [examData, isReady]);

    useEffect(() => {
        if (isReady && examData?.exam) {
            navigate(`/exam-instructions/${studentId}`);
        }
    }, [isReady, examData, studentId, navigate]);

    const handleRefresh = () => {
        refetch();
    };

    const timerMode = examData?.exam?.timer_mode;
    const timerStartType = examData?.exam?.timer_start_type;
    const scheduledStartTime = examData?.exam?.scheduled_start_time;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                {/* Logo Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100">
                        <img src={logo} alt="BUK KANO Logo" className="w-10 h-10 object-contain" />
                        <div className="text-left">
                            <h1 className="text-lg font-bold text-gray-900">BUK KANO</h1>
                            <p className="text-xs text-gray-500">Computer Based Test Portal</p>
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <FaRegClock className="text-white text-2xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Please Wait</h2>
                        <p className="text-blue-100 mt-1">Your exam hasn't started yet</p>
                    </div>

                    {/* Student Info */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            {student?.image ? (
                                <img
                                    src={`${path.replace('/api', '')}/${student.image}`}
                                    alt={student.full_name}
                                    className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-blue-100"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold shadow-md">
                                    {student?.full_name?.charAt(0) || "S"}
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-gray-900">{student?.full_name || "Loading..."}</p>
                                <p className="text-sm text-gray-500">{student?.candidate_no || "..."}</p>
                            </div>
                        </div>
                    </div>

                    {/* Exam Info */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Exam</p>
                            <p className="font-bold text-gray-900">{course?.title || "Loading..."}</p>
                            <p className="text-sm text-gray-600">{course?.code || "..."}</p>
                        </div>
                    </div>

                    {/* Waiting Message */}
                    <div className="p-6">
                        {timerMode === 'global' && timerStartType === 'manual' ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                                    <FaUser className="text-yellow-600 text-3xl" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Waiting for Technician</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    The technician has not started the exam yet. Please wait patiently. 
                                    The exam timer will begin once the technician activates it.
                                </p>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-2 text-yellow-800">
                                        <FaInfoCircle className="flex-shrink-0" />
                                        <p className="text-sm">You will be automatically redirected when the exam starts.</p>
                                    </div>
                                </div>
                            </div>
                        ) : timerMode === 'global' && timerStartType === 'scheduled' && scheduledStartTime ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                    <FaCalendarAlt className="text-blue-600 text-3xl" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Scheduled Exam</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Your exam is scheduled to start at:
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-lg font-bold text-blue-900">
                                        {new Date(scheduledStartTime).toLocaleString()}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">Time remaining until exam starts:</p>
                                <div className="flex justify-center gap-3 mb-6">
                                    <div className="bg-gray-900 text-white rounded-lg p-3 min-w-[60px]">
                                        <p className="text-2xl font-bold">{String(countdown.hours).padStart(2, '0')}</p>
                                        <p className="text-xs text-gray-400">Hours</p>
                                    </div>
                                    <div className="bg-gray-900 text-white rounded-lg p-3 min-w-[60px]">
                                        <p className="text-2xl font-bold">{String(countdown.minutes).padStart(2, '0')}</p>
                                        <p className="text-xs text-gray-400">Minutes</p>
                                    </div>
                                    <div className="bg-gray-900 text-white rounded-lg p-3 min-w-[60px]">
                                        <p className="text-2xl font-bold">{String(countdown.seconds).padStart(2, '0')}</p>
                                        <p className="text-xs text-gray-400">Seconds</p>
                                    </div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-blue-800">
                                        <FaInfoCircle className="flex-shrink-0" />
                                        <p className="text-sm">You will be automatically redirected when the scheduled time arrives.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-gray-600">Loading exam status...</p>
                            </div>
                        )}
                    </div>

                    {/* Refresh Button */}
                    <div className="p-6 pt-0">
                        <button
                            onClick={handleRefresh}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            <FaSync className="text-sm" />
                            Check Status
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                        If you believe this is an error, please contact your invigilator.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WaitingRoom;
