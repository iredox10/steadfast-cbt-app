import React, { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
    useLocation,
    unstable_HistoryRouter,
} from "react-router-dom";
import Sidebar from "../components/Sidebar";
import useFetch from "../hooks/useFetch";
import axios from "axios";
import { path } from "../../utils/path";

const ExamInstructions = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { data: examData } = useFetch(`/get-student-exam`);
    // const { data: student } = useFetch(`/get-student/${studentId}`);
    const { data: student } = useFetch(`/get-student/${studentId}`);

    const [course, setCourse] = useState(null);

    const fetchCourse = async () => {
        try {
            if (examData?.exam?.course_id) {
                const res = await axios.get(
                    `${path}/get-course/${examData.exam.course_id}`
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
    const durationInMinutes = examData?.exam?.exam_duration
        ? Math.round(examData.exam.exam_duration / 60)
        : 0;

    const handleStartExam = () => {
        navigate(`/student/${studentId}`);
    };

    return (
        <div className="grid grid-cols-6 gap-4 min-h-screen">
            <Sidebar />
            <div className="col-start-2 col-end-7 p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        {/* Header */}
                        <div className="border-b pb-4 mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">
                                Exam Instructions
                            </h1>
                            <p className="text-gray-600">
                                Please read all instructions carefully before
                                proceeding
                            </p>
                        </div>

                        {/* Student Info */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <h2 className="font-semibold text-gray-800 mb-2">
                                Student Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4 text-sm capitalize">
                                <p>
                                    <span className="font-medium">Name:</span>{" "}
                                    {student?.full_name}
                                </p>
                                <p>
                                    <span className="font-medium">ID:</span>{" "}
                                    {student?.candidate_no}
                                </p>
                                <p>
                                    <span className="font-medium">Course:</span>{" "}
                                    {course?.title}
                                </p>
                                <p>
                                    <span className="font-medium">
                                        Duration:
                                    </span>{" "}
                                    {durationInMinutes} minutes
                                </p>
                            </div>
                        </div>

                        {/* Specific Instructions */}
                        <div className="mb-6">
                            <h2 className="font-semibold text-gray-800 mb-3">
                                Exam Instructions:
                            </h2>
                            <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                                {examData?.exam?.instructions ||
                                    "No specific instructions provided."}
                            </div>
                        </div>

                        {/* General Instructions */}
                        <div className="mb-6">
                            <h2 className="font-semibold text-gray-800 mb-3">
                                General Instructions:
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-gray-600">
                                <li>
                                    This exam contains{" "}
                                    {examData?.questions?.length} questions
                                </li>
                                <li>
                                    Each question carries{" "}
                                    {examData?.exam?.marks_per_question} marks
                                </li>
                                <li>
                                    Timer will start as soon as you begin the
                                    exam
                                </li>
                                <li>
                                    You cannot return to the exam once submitted
                                </li>
                            </ul>
                        </div>


                        {/* Declaration */}
                        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                            <p className="text-sm text-yellow-800">
                                By clicking "Start Exam", you agree that you
                                have read and understood all instructions, and
                                will comply with the examination rules.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleStartExam}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Start Exam
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamInstructions;
