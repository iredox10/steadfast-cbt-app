import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { path } from "../../../utils/path";
import Sidebar from "../../components/Sidebar";
import { FaTachometerAlt, FaBook, FaSearch, FaChartBar, FaUsers, FaFileAlt, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const CourseResults = () => {
    const { userId, courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        fetchCourse();
        fetchExams();
    }, [courseId, userId]);

    const fetchCourse = async () => {
        try {
            const headers = getAuthHeaders();
            const res = await axios.get(`${path}/get-course/${courseId}`, { headers });
            setCourse(res.data);
        } catch (err) {
            console.error("Error fetching course:", err);
            setError("Failed to load course information");
        }
    };

    const fetchExams = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            const res = await axios.get(`${path}/get-exams/${userId}/${courseId}`, { headers });
            // Filter only terminated exams (exams that have finished_time)
            const terminatedExams = res.data.filter(exam => 
                exam.finished_time !== null && exam.finished_time !== undefined
            );
            console.log("Terminated exams:", terminatedExams);
            setExams(terminatedExams);
        } catch (err) {
            console.error("Error fetching exams:", err);
            setError("Failed to load exams");
        } finally {
            setLoading(false);
        }
    };

    const fetchExamResults = async (examId) => {
        try {
            setResultsLoading(true);
            const headers = getAuthHeaders();
            
            // Fetch exam archive or create a similar structure
            // We'll fetch all necessary data and combine it
            
            // 1. Get the exam details
            const examRes = await axios.get(`${path}/get-exam-by-id/${examId}`, { headers });
            const exam = examRes.data;
            
            // 2. Get all questions for this exam
            const questionsRes = await axios.get(`${path}/get-questions/${examId}`, { headers });
            const totalQuestions = questionsRes.data.length;
            
            // 3. Get course scores for students in this course
            const scoresRes = await axios.get(`${path}/get-students-score/${courseId}`, { headers });
            const courseScores = scoresRes.data;
            
            // 4. Filter to only students who have scores (submitted)
            const resultsWithScores = courseScores.map(scoreData => {
                return {
                    student_id: scoreData.student_id,
                    full_name: scoreData.student?.full_name || 'N/A',
                    candidate_no: scoreData.student?.candidate_no || 'N/A',
                    department: scoreData.student?.department || 'N/A',
                    programme: scoreData.student?.programme || 'N/A',
                    score: scoreData.score || 0,
                    submitted_at: scoreData.updated_at,
                    total_questions: totalQuestions,
                    has_submitted: true
                };
            });
            
            console.log("Exam results:", resultsWithScores);
            setResults(resultsWithScores);
        } catch (err) {
            console.error("Error fetching results:", err);
            setError("Failed to load exam results");
            setResults([]);
        } finally {
            setResultsLoading(false);
        }
    };

    const handleExamSelect = async (exam) => {
        setSelectedExam(exam);
        await fetchExamResults(exam.id);
    };

    const filteredResults = results.filter(result => {
        const searchLower = searchTerm.toLowerCase();
        return (
            result.full_name?.toLowerCase().includes(searchLower) ||
            result.candidate_no?.toLowerCase().includes(searchLower)
        );
    });

    const calculateStats = () => {
        if (!results.length) return { average: 0, highest: 0, lowest: 0, passed: 0, failed: 0 };
        
        const scores = results.map(r => parseFloat(r.score) || 0);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highest = Math.max(...scores);
        const lowest = Math.min(...scores);
        const passmark = selectedExam?.max_score ? selectedExam.max_score * 0.5 : 50;
        const passed = scores.filter(s => s >= passmark).length;
        const failed = scores.filter(s => s < passmark).length;

        return { average: average.toFixed(2), highest, lowest, passed, failed };
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const stats = calculateStats();
        
        doc.setFontSize(18);
        doc.text(`${course?.title || 'Course'} - Exam Results`, 14, 20);
        doc.setFontSize(12);
        doc.text(`Exam: ${selectedExam?.exam_type || 'N/A'}`, 14, 30);
        doc.text(`Date: ${format(new Date(), 'dd/MM/yyyy')}`, 14, 36);
        
        doc.setFontSize(10);
        doc.text(`Average: ${stats.average} | Highest: ${stats.highest} | Lowest: ${stats.lowest}`, 14, 45);
        doc.text(`Passed: ${stats.passed} | Failed: ${stats.failed}`, 14, 51);

        const tableData = filteredResults.map((result, index) => {
            const percentage = selectedExam.max_score > 0 
                ? ((result.score / selectedExam.max_score) * 100).toFixed(2)
                : '0';
            
            return [
                index + 1,
                result.full_name || 'N/A',
                result.candidate_no || 'N/A',
                result.score || '0',
                `${percentage}%`,
                result.submitted_at ? format(new Date(result.submitted_at), 'dd/MM/yyyy HH:mm') : 'N/A'
            ];
        });

        autoTable(doc, {
            startY: 58,
            head: [['#', 'Student Name', 'Candidate Number', 'Score', 'Percentage', 'Submitted']],
            body: tableData,
        });

        doc.save(`${course?.code || 'course'}_exam_results_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    };

    const exportToExcel = () => {
        const stats = calculateStats();
        const wsData = [
            ['Course Results Report'],
            ['Course:', course?.title || 'N/A'],
            ['Exam:', selectedExam?.exam_type || 'N/A'],
            ['Date:', format(new Date(), 'dd/MM/yyyy')],
            [],
            ['Statistics'],
            ['Average Score:', stats.average],
            ['Highest Score:', stats.highest],
            ['Lowest Score:', stats.lowest],
            ['Passed:', stats.passed],
            ['Failed:', stats.failed],
            [],
            ['#', 'Student Name', 'Candidate Number', 'Score', 'Percentage', 'Submitted'],
            ...filteredResults.map((result, index) => {
                const percentage = selectedExam.max_score > 0 
                    ? ((result.score / selectedExam.max_score) * 100).toFixed(2)
                    : '0';
                
                return [
                    index + 1,
                    result.full_name || 'N/A',
                    result.candidate_no || 'N/A',
                    result.score || '0',
                    `${percentage}%`,
                    result.submitted_at ? format(new Date(result.submitted_at), 'dd/MM/yyyy HH:mm') : 'N/A'
                ];
            })
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Results');
        XLSX.writeFile(wb, `${course?.code || 'course'}_exam_results_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
    };

    const stats = calculateStats();

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <Sidebar>
                <Link
                    to={`/instructor/dashboard/${userId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaTachometerAlt />
                    <span>Dashboard</span>
                </Link>
                <Link
                    to={`/instructor/${userId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaBook />
                    <span>Courses</span>
                </Link>
                <Link
                    to={`/instructor-student/${userId}/${courseId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaUsers />
                    <span>Students</span>
                </Link>
                <Link
                    to={`/course-results/${userId}/${courseId}`}
                    className="flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg transition-colors duration-200"
                >
                    <FaChartBar />
                    <span>Results</span>
                </Link>
            </Sidebar>

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
                            <p className="text-gray-600 mt-1">{course?.title || 'Loading...'} - {course?.code}</p>
                        </div>
                        <Link
                            to={`/instructor/${userId}`}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Back to Courses
                        </Link>
                    </div>
                </header>

                {/* Exams Selection */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Select Exam</h2>
                    {loading ? (
                        <div className="text-center py-8">
                            <i className="fas fa-spinner fa-spin text-blue-500 text-3xl mb-4"></i>
                            <p className="text-gray-600">Loading exams...</p>
                        </div>
                    ) : exams.length === 0 ? (
                        <div className="text-center py-8">
                            <FaFileAlt className="text-gray-300 text-5xl mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Exams</h3>
                            <p className="text-gray-600">There are no terminated exams for this course yet. Results will be available after exams are terminated.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {exams.map((exam) => (
                                <button
                                    key={exam.id}
                                    onClick={() => handleExamSelect(exam)}
                                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                                        selectedExam?.id === exam.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300 bg-white'
                                    }`}
                                >
                                    <h3 className="font-semibold text-gray-900 mb-1">{exam.exam_type}</h3>
                                    <p className="text-sm text-gray-600">Duration: {exam.exam_duration} mins</p>
                                    <p className="text-sm text-gray-600">Max Score: {exam.max_score}</p>
                                    <span className="inline-block mt-2 px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                        Terminated
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {selectedExam && (
                    <>
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.average}</p>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <p className="text-sm text-gray-600 mb-1">Highest Score</p>
                                <p className="text-2xl font-bold text-green-600">{stats.highest}</p>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <p className="text-sm text-gray-600 mb-1">Lowest Score</p>
                                <p className="text-2xl font-bold text-red-600">{stats.lowest}</p>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <p className="text-sm text-gray-600 mb-1">Passed</p>
                                <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <p className="text-sm text-gray-600 mb-1">Failed</p>
                                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Student Results</h2>
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search students..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button
                                        onClick={exportToPDF}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                                    >
                                        <FaFilePdf />
                                        PDF
                                    </button>
                                    <button
                                        onClick={exportToExcel}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                                    >
                                        <FaFileExcel />
                                        Excel
                                    </button>
                                </div>
                            </div>

                            {resultsLoading ? (
                                <div className="text-center py-8">
                                    <i className="fas fa-spinner fa-spin text-blue-500 text-3xl mb-4"></i>
                                    <p className="text-gray-600">Loading results...</p>
                                </div>
                            ) : results.length === 0 ? (
                                <div className="text-center py-8">
                                    <FaUsers className="text-gray-300 text-5xl mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Available</h3>
                                    <p className="text-gray-600">No students have submitted this exam yet.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate Number</th>
                                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredResults.map((result, index) => {
                                                const percentage = selectedExam.max_score > 0 
                                                    ? (result.score / selectedExam.max_score) * 100 
                                                    : 0;
                                                const passed = percentage >= 50;
                                                
                                                return (
                                                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                                        <td className="py-4 px-6 text-sm text-gray-600">{index + 1}</td>
                                                        <td className="py-4 px-6 text-sm font-medium text-gray-900">{result.full_name || 'N/A'}</td>
                                                        <td className="py-4 px-6 text-sm text-gray-600">{result.candidate_no || 'N/A'}</td>
                                                        <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                                                            {result.score || '0'} / {selectedExam.max_score}
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-gray-600">{percentage.toFixed(2)}%</td>
                                                        <td className="py-4 px-6">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                            }`}>
                                                                {passed ? 'Passed' : 'Failed'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-gray-600">
                                                            {result.submitted_at 
                                                                ? format(new Date(result.submitted_at), 'dd/MM/yyyy HH:mm')
                                                                : 'N/A'
                                                            }
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default CourseResults;
