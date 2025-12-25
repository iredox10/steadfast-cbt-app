import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { path } from "../../../utils/path";
import Sidebar from "../../components/Sidebar";
import { FaTachometerAlt, FaBook, FaUsers, FaChartBar, FaArrowLeft, FaFilePdf, FaFileExcel, FaSearch } from "react-icons/fa";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ExamResultsDetail = () => {
    const { userId, courseId, examId } = useParams();
    const [exam, setExam] = useState(null);
    const [course, setCourse] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        fetchExamDetails();
    }, [examId, courseId]);

    const fetchExamDetails = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();

            // Fetch exam details
            const examRes = await axios.get(`${path}/get-exam-by-id/${examId}`, { headers });
            const examData = examRes.data;
            setExam(examData);

            // Fetch course details
            const courseRes = await axios.get(`${path}/get-course/${courseId}`, { headers });
            setCourse(courseRes.data);

            // Try to fetch archive data for this exam first
            try {
                const archiveRes = await axios.get(`${path}/get-archive-by-exam/${examId}`, { headers });
                const archiveData = archiveRes.data;
                
                if (archiveData && archiveData.student_results) {
                    const mappedResults = archiveData.student_results.map(res => ({
                        student_id: res.student_id,
                        full_name: res.full_name || 'N/A',
                        candidate_no: res.candidate_no || 'N/A',
                        department: res.department || 'N/A',
                        score: res.score || 0,
                        questions_answered: res.questions_answered,
                        correct_answers: res.correct_answers,
                        submitted_at: res.submission_time,
                        total_questions: archiveData.total_questions || examData.no_of_questions
                    }));
                    setResults(mappedResults);
                    setLoading(false);
                    return; // Exit early as we have the best data
                }
            } catch (archiveErr) {
                console.log("No archive found, falling back to course scores");
            }

            // Fallback: Fetch student scores for this course (legacy/live logic)
            const questionsRes = await axios.get(`${path}/get-questions/${examId}`, { headers });
            const totalQuestions = questionsRes.data.length;

            const scoresRes = await axios.get(`${path}/get-students-score/${courseId}`, { headers });
            
            const resultsData = scoresRes.data.map(scoreData => ({
                student_id: scoreData.student_id,
                full_name: scoreData.student?.full_name || 'N/A',
                candidate_no: scoreData.student?.candidate_no || 'N/A',
                department: scoreData.student?.department || 'N/A',
                score: scoreData.score || 0,
                status: scoreData.status || 'submitted',
                submitted_at: scoreData.submitted_at || scoreData.updated_at,
                total_questions: totalQuestions,
                questions_answered: 'N/A', // Not available in legacy/live scores
                correct_answers: 'N/A'
            }));

            setResults(resultsData);
        } catch (err) {
            console.error("Error fetching exam details:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredResults = results.filter(result => {
        const searchLower = searchTerm.toLowerCase();
        return (
            result.full_name?.toLowerCase().includes(searchLower) ||
            result.candidate_no?.toLowerCase().includes(searchLower)
        );
    });

    const calculateStats = () => {
        if (!results.length || !exam) return { average: 0, highest: 0, lowest: 0, passed: 0, failed: 0 };

        const scores = results.map(r => parseFloat(r.score) || 0);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highest = Math.max(...scores);
        const lowest = Math.min(...scores);
        const passmark = exam.max_score * 0.5;
        const passed = scores.filter(s => s >= passmark).length;
        const failed = scores.filter(s => s < passmark).length;

        return { average: average.toFixed(2), highest, lowest, passed, failed };
    };

    const stats = calculateStats();

    const exportToPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text(`${course?.title || 'Course'} - Exam Results`, 14, 20);
        doc.setFontSize(12);
        doc.text(`Exam: ${exam?.exam_type || 'N/A'}`, 14, 30);
        doc.text(`Date: ${format(new Date(), 'dd/MM/yyyy')}`, 14, 36);
        
        doc.setFontSize(10);
        doc.text(`Average: ${stats.average} | Highest: ${stats.highest} | Lowest: ${stats.lowest}`, 14, 45);
        doc.text(`Passed: ${stats.passed} | Failed: ${stats.failed}`, 14, 51);

        const tableData = filteredResults.map((result, index) => {
            const percentage = exam.max_score > 0 
                ? ((result.score / exam.max_score) * 100).toFixed(2)
                : '0';
            
            return [
                index + 1,
                result.full_name || 'N/A',
                result.candidate_no || 'N/A',
                result.questions_answered !== undefined && result.questions_answered !== 'N/A'
                    ? `${result.questions_answered} / ${result.total_questions || 'N/A'}`
                    : 'N/A',
                result.score,
                `${percentage}%`,
                result.submitted_at ? format(new Date(result.submitted_at), 'dd/MM/yyyy HH:mm') : 'N/A'
            ];
        });

        autoTable(doc, {
            startY: 58,
            head: [['#', 'Student Name', 'Candidate Number', 'Questions Answered', 'Score', 'Percentage', 'Submitted']],
            body: tableData,
        });

        doc.save(`${course?.code || 'course'}_exam_results_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    };

    const exportToExcel = () => {
        const wsData = [
            ['Course Results Report'],
            ['Course:', course?.title || 'N/A'],
            ['Exam:', exam?.exam_type || 'N/A'],
            ['Date:', format(new Date(), 'dd/MM/yyyy')],
            [],
            ['Statistics'],
            ['Average Score:', stats.average],
            ['Highest Score:', stats.highest],
            ['Lowest Score:', stats.lowest],
            ['Passed:', stats.passed],
            ['Failed:', stats.failed],
            [],
            ['#', 'Student Name', 'Candidate Number', 'Questions Answered', 'Score', 'Percentage', 'Submitted'],
            ...filteredResults.map((result, index) => {
                const percentage = exam.max_score > 0 
                    ? ((result.score / exam.max_score) * 100).toFixed(2)
                    : '0';
                
                return [
                    index + 1,
                    result.full_name || 'N/A',
                    result.candidate_no || 'N/A',
                    result.questions_answered !== undefined && result.questions_answered !== 'N/A'
                        ? `${result.questions_answered} / ${result.total_questions || 'N/A'}`
                        : 'N/A',
                    result.score,
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

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading exam results...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
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
                            <p className="text-gray-600 mt-1">
                                {course?.title} - {exam?.exam_type}
                            </p>
                        </div>
                        <Link
                            to={`/course-results/${userId}/${courseId}`}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <FaArrowLeft />
                            Back to Archives
                        </Link>
                    </div>
                </header>

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

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate Number</th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions Answered</th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredResults.length > 0 ? (
                                    filteredResults.map((result, index) => {
                                        const percentage = exam?.max_score > 0 
                                            ? (result.score / exam.max_score) * 100 
                                            : 0;
                                        const passed = percentage >= 50;
                                        
                                        return (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="py-4 px-6 text-sm text-gray-600">{index + 1}</td>
                                                <td className="py-4 px-6 text-sm font-medium text-gray-900">{result.full_name}</td>
                                                <td className="py-4 px-6 text-sm text-gray-600">{result.candidate_no}</td>
                                                <td className="py-4 px-6 text-sm text-gray-600">
                                                    {result.questions_answered !== undefined && result.questions_answered !== 'N/A'
                                                        ? `${result.questions_answered} / ${result.total_questions || 'N/A'}`
                                                        : 'N/A'}
                                                </td>
                                                <td className="py-4 px-6 text-sm">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {result.score}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600">{percentage.toFixed(2)}%</td>
                                                <td className="py-4 px-6 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        result.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                                        passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {result.status === 'in_progress' ? 'In Progress' : passed ? 'Pass' : 'Fail'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <FaUsers className="text-4xl mb-2 opacity-20" />
                                                <p className="text-lg font-medium">No results found</p>
                                                <p className="text-sm">There are no students recorded for this exam yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ExamResultsDetail;
