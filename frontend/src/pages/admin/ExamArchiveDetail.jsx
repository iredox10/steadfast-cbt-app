import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaSearch, FaChevronRight, FaArrowUp, FaArrowDown, FaFilePdf, FaFileExcel, FaUserClock, FaExclamationTriangle, FaClock, FaPowerOff, FaCheckCircle } from "react-icons/fa";
import { path } from "../../../utils/path";
import { format } from 'date-fns';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import AdminSidebar from "../../components/AdminSidebar";

const submissionReasonLabels = {
    manual: 'Student Submitted',
    time_expired: 'Time Expired',
    violations_exceeded: 'Violations Exceeded',
    exam_terminated: 'Exam Terminated'
};

const submissionReasonIcons = {
    manual: FaCheckCircle,
    time_expired: FaClock,
    violations_exceeded: FaExclamationTriangle,
    exam_terminated: FaPowerOff
};

const submissionReasonColors = {
    manual: 'bg-green-100 text-green-800',
    time_expired: 'bg-orange-100 text-orange-800',
    violations_exceeded: 'bg-red-100 text-red-800',
    exam_terminated: 'bg-purple-100 text-purple-800'
};

const ExamArchiveDetail = () => {
    const { archiveId, userId } = useParams();
    const [archive, setArchive] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 10;

    useEffect(() => {
        const fetchArchiveDetails = async () => {
            setLoading(true);
            try {
                console.log('Fetching archive details for ID:', archiveId);

                // Get the auth token from localStorage
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const res = await axios.get(`${path}/exam-archives/${archiveId}`, { headers });
                console.log('Archive data received:', res.data);
                console.log('Student results:', res.data.student_results);
                setArchive(res.data);
            } catch (err) {
                console.error("Error fetching archive details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchArchiveDetails();
    }, [archiveId]);

    const sortedAndFilteredResults = useMemo(() => {
        if (!archive?.student_results) return [];

        let results = [...archive.student_results]
            .filter(result =>
                result.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                result.candidate_no.toLowerCase().includes(searchTerm.toLowerCase())
            );

        results.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return results;
    }, [archive, searchTerm, sortConfig]);

    const paginatedResults = useMemo(() => {
        const startIndex = (currentPage - 1) * resultsPerPage;
        return sortedAndFilteredResults.slice(startIndex, startIndex + resultsPerPage);
    }, [sortedAndFilteredResults, currentPage]);

    const totalPages = Math.ceil(sortedAndFilteredResults.length / resultsPerPage);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader = ({ children, name }) => (
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(name)}>
            <div className="flex items-center">
                {children}
                {sortConfig.key === name && (sortConfig.direction === 'asc' ? <FaArrowUp className="ml-2" /> : <FaArrowDown className="ml-2" />)}
            </div>
        </th>
    );

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`Exam Results for ${archive.exam_title}`, 14, 15);
        doc.setFontSize(10);
        doc.text(`Course: ${archive.course_title}`, 14, 22);
        doc.text(`Date: ${format(new Date(archive.exam_date), 'PPP')}`, 14, 27);
        doc.text(`Duration: ${archive.duration} minutes`, 14, 32);
        doc.text(`Total Questions: ${archive.total_questions || 'N/A'}`, 14, 37);
        doc.text(`Questions to Answer: ${archive.exam?.actual_questions || 'N/A'}`, 14, 42);
        doc.text(`Total Marks: ${archive.total_marks || 'N/A'}`, 14, 47);

        autoTable(doc, {
            startY: 53,
            head: [['Full Name', 'Candidate No.', 'Right/Wrong', 'Score', 'Submission Reason', 'Time']],
            body: sortedAndFilteredResults.map(result => [
                result.full_name,
                result.candidate_no,
                `${result.correct_answers || 0}/${(result.questions_answered || 0) - (result.correct_answers || 0)}`,
                result.score,
                submissionReasonLabels[result.submission_reason] || result.submission_reason || 'N/A',
                result.submission_time ? format(new Date(result.submission_time), 'Pp') : 'N/A'
            ]),
        });

        doc.save(`exam-results-${archive.exam_title}.pdf`);
    };

    const handleDownloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            sortedAndFilteredResults.map(result => ({
                'Full Name': result.full_name,
                'Candidate No.': result.candidate_no,
                'Right/Wrong': `${result.correct_answers || 0}/${(result.questions_answered || 0) - (result.correct_answers || 0)}`,
                'Score': result.score,
                'Submission Reason': submissionReasonLabels[result.submission_reason] || result.submission_reason || 'N/A',
                'Violations': result.violation_count || 0,
                'Submission Time': result.submission_time ? format(new Date(result.submission_time), 'Pp') : 'N/A'
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
        XLSX.writeFile(workbook, `exam-results-${archive.exam_title}.xlsx`);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <AdminSidebar userId={userId} />

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="mb-8">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Link to="/exam-archives" className="hover:underline">Exam Archives</Link>
                        <FaChevronRight className="mx-2" />
                        <span className="font-medium text-gray-800">{archive?.exam_title || "Archive"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-bold text-gray-900">Exam Archive Details</h2>
                        <div className="flex gap-2">
                            <button onClick={handleDownloadPdf} className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2">
                                <FaFilePdf /> PDF
                            </button>
                            <button onClick={handleDownloadExcel} className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2">
                                <FaFileExcel /> Excel
                            </button>
                        </div>
                    </div>
                </header>

                {loading ? <p>Loading...</p> : archive ? (
                    <>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Exam Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Exam Title</span>
                                    <p className="font-semibold text-gray-900">{archive?.exam_title || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Course</span>
                                    <p className="font-semibold text-gray-900">{archive?.course_title || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Date</span>
                                    <p className="font-semibold text-gray-900">{archive?.exam_date ? format(new Date(archive.exam_date), 'PPP') : 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Duration</span>
                                    <p className="font-semibold text-gray-900">{archive?.duration ? `${archive.duration} minutes` : 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-pink-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Total Questions</span>
                                    <p className="font-semibold text-gray-900">{archive?.total_questions || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Questions to Answer</span>
                                    <p className="font-semibold text-gray-900">{archive?.exam?.actual_questions || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-indigo-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Mark Detail</span>
                                    <p className="font-semibold text-gray-900">{archive?.marks_per_question} / {archive.total_marks}</p>
                                </div>
                                <div className="p-4 bg-teal-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Total Students</span>
                                    <p className="font-semibold text-gray-900">{archive.student_results?.length || 0}</p>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Activated By</span>
                                    <p className="font-semibold text-gray-900">{archive.activated_by_name || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-rose-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Terminated By</span>
                                    <p className="font-semibold text-gray-900">{archive.terminated_by_name || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="relative mb-4">
                                <FaSearch className="absolute top-3 left-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or candidate no..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full"
                                />
                            </div>
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <SortableHeader name="full_name">Full Name</SortableHeader>
                                        <SortableHeader name="candidate_no">Candidate No.</SortableHeader>
                                        <SortableHeader name="correct_answers">Right/Wrong</SortableHeader>
                                        <SortableHeader name="score">Score</SortableHeader>
                                        <SortableHeader name="submission_reason">Submission Reason</SortableHeader>
                                        <SortableHeader name="submission_time">Submission Time</SortableHeader>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginatedResults.map((result, index) => {
                                        const reason = result.submission_reason || 'manual';
                                        const ReasonIcon = submissionReasonIcons[reason] || FaUserClock;
                                        const reasonLabel = submissionReasonLabels[reason] || reason;
                                        const reasonColor = submissionReasonColors[reason] || 'bg-gray-100 text-gray-800';

                                        return (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{result.full_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{result.candidate_no}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {result.correct_answers !== undefined
                                                            ? `${result.correct_answers} / ${(result.questions_answered || 0) - result.correct_answers}`
                                                            : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {result.score}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${reasonColor}`}>
                                                            <ReasonIcon className="text-xs" />
                                                            {reasonLabel}
                                                        </span>
                                                        {result.violation_count > 0 && (
                                                            <span className="text-xs text-red-600 font-medium">
                                                                ({result.violation_count} violation{result.violation_count > 1 ? 's' : ''})
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{result.submission_time ? format(new Date(result.submission_time), 'Pp') : 'N/A'}</div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">
                                        Previous
                                    </button>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No archive data found</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ExamArchiveDetail;