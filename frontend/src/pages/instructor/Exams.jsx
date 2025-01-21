import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import Sidebar from "../../components/Sidebar";
import GridLayout from "../../components/GridLayout";
import { FaCheck, FaTimes } from "react-icons/fa";
import FormBtn from "../../components/FormBtn";
import Btn from "../../components/Btn";
import FormInput from "../../components/FormInput";
import axios from "axios";
import {format } from 'date-fns'
import { path } from "../../../utils/path";
import Model from "../../components/Model";

const Exams = () => {
    const { userId, courseId } = useParams();

    const [showModel, setshowModel] = useState(false);
    const [showDeleteModel, setShowDeleteModel] = useState(false);
    const [showSubmitModel, setShowSubmitModel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const {
        data: course,
        loading: courseLoading,
        err: courseErr,
    } = useFetch(`/get-course/${courseId}`);
    console.log(course);

    const [maxScore, setMaxScore] = useState("");
    const [instructions, setInstructions] = useState("");
    const [noOfQuestions, setNoOfQuestions] = useState();
    const [acutualQuestions, setAcutualQuestions] = useState();
    const [examType, setExamType] = useState();
    const [exmaDuration, setExmaDuration] = useState();
    const [marksPerQuestion, setMarkPerQuestion] = useState();

    const [exams, setExams] = useState();
    const [exam, setExam] = useState();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Adjust number of items per page as needed

    const fetch = async () => {
        try {
            setLoading(true);
            const res = await axios(`${path}/get-exams/${userId}/${courseId}`);
            setExams(res.data);
            console.log(exams);
        } catch (err) {
            setErr(err.response.data.message);
            console.log(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetch();
    }, [exam]);

    // useEffect(() => {
    //     fetch();
    // }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(
                `${path}/add-exam/${userId}/${courseId}`,
                {
                    instructions,
                    max_score: maxScore,
                    no_of_questions: noOfQuestions,
                    actual_questions: acutualQuestions,
                    exam_type: examType,
                    exam_duration: exmaDuration,
                    marks_per_question: marksPerQuestion,
                }
            );
            if (res.status == 201) {
                setshowModel(false);
                fetch();
            }
            console.log(res.data);
        } catch (err) {
            setErr(err.response.data.message);
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleShowSubmitModel = async (examId) => {
        setShowSubmitModel(true);
        try {
            setLoading(true);
            const res = await axios(`${path}/get-exam-by-id/${examId}`);
            setExam(res.data);
            console.log(exam.id);
        } catch (error) {
            setErr(error.response.data.message);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    const handleSubmitExam = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${path}/submit-exam/${exam.id}`);
            console.log(res.data);
            setShowSubmitModel(false);
            fetch();
        } catch (error) {
            setErr(error.response.data.message);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredExams = exams?.filter((exam) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.exam_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.exam_duration.toString().includes(searchTerm)
    );

    // Calculate pagination values
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredExams?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((filteredExams?.length || 0) / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <GridLayout>
            <Sidebar>
                <Link
                    to={`/instructor-student/${userId}/${courseId}`}
                    className="flex items-center gap-2 px-4 py-2 text-white hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors duration-200"
                >
                    <i className="fas fa-users"></i>
                    <span>Candidates</span>
                </Link>
                
                
            </Sidebar>
            <div className="p-8 col-span-5 bg-gray-50">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                            {course.title} Exams
                        </h1>
                        <p className="text-gray-600">Manage and monitor course examinations</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search exams..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        </div>
                        <button
                            onClick={() => setshowModel(!showModel)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fas fa-plus"></i>
                            )}
                            <span>Add Exam</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S/N</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course Name</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Questions</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actual Questions</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4">
                                            <i className="fas fa-spinner fa-spin mr-2"></i>
                                            Loading...
                                        </td>
                                    </tr>
                                ) : currentItems && currentItems.map((exam, index) => (
                                    <tr key={exam.id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="py-4 px-6 text-sm text-gray-600">{indexOfFirstItem + index + 1}</td>
                                        <td className="py-4 px-6">
                                            <Link to={`/exam-questions/${userId}/${courseId}/${exam.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                                                {course.title}
                                            </Link>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{exam.no_of_questions}</td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{exam.actual_questions}</td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{exam.exam_duration} seconds</td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                exam.exam_type === 'school' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {exam.exam_type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {exam.submission_status === "submitted" ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <FaCheck className="w-3 h-3" />
                                                    Submitted
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <FaTimes className="w-3 h-3" />
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{format(new Date(exam.updated_at), 'Pp')}</td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={() => handleShowSubmitModel(exam.id)}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                ) : (
                                                    'Submit'
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredExams?.length || 0)} of {filteredExams?.length || 0} entries
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                                        currentPage === 1 || loading
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }`}
                                >
                                    Previous
                                </button>
                                
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => paginate(index + 1)}
                                        disabled={loading}
                                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                                            currentPage === index + 1
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                                
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages || loading}
                                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                                        currentPage === totalPages || loading
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showSubmitModel && (
                <Model>
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                        <div className="text-center">
                            <div className="mb-6">
                                <i className="fas fa-exclamation-circle text-yellow-500 text-4xl"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Submit Exam?
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Are you sure you want to submit this exam? This action cannot be undone.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleSubmitExam}
                                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                    ) : null}
                                    Yes, Submit
                                </button>
                                <button
                                    onClick={() => setShowSubmitModel(false)}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </Model>
            )}

            {showModel && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg max-w-2xl w-full">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Add New Exam</h2>
                            <button 
                                onClick={() => setshowModel(false)}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
                                disabled={loading}
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {err && (
                                <div className="p-4 text-red-700 bg-red-100 rounded-lg">
                                    <p>{err}</p>
                                </div>
                            )}

                            <div className="relative">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Exam Type
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-white px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-700 hover:border-gray-300"
                                        onChange={(e) => setExamType(e.target.value)}
                                        defaultValue=""
                                        disabled={loading}
                                    >
                                        <option value="" disabled>Select Exam Type</option>
                                        <option value="school" className="py-2">School Examination</option>
                                        <option value="external" className="py-2">External Assessment</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                        <i className="fas fa-chevron-down"></i>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Instructions
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="3"
                                    placeholder="Enter exam instructions..."
                                    onChange={(e) => setInstructions(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Maximum Score
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter max score"
                                        onChange={(e) => setMaxScore(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration (seconds)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter duration in seconds"
                                        onChange={(e) => setExmaDuration(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Questions
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter total questions"
                                        onChange={(e) => setNoOfQuestions(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Questions to Display
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter questions to display"
                                        onChange={(e) => setAcutualQuestions(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Marks per Question
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter marks per question"
                                    onChange={(e) => setMarkPerQuestion(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button
                                type="button"
                                onClick={() => setshowModel(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Adding...
                                    </>
                                ) : (
                                    'Add Exam'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </GridLayout>
    );
};

export default Exams;
