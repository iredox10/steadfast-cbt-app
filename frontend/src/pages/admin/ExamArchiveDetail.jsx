import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaCalendarAlt, FaBook, FaChalkboardTeacher, FaCog, FaSignOutAlt, FaListAlt, FaSearch, FaUsers, FaChevronRight, FaArrowUp, FaArrowDown, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { path } from "../../../utils/path";
import { format } from 'date-fns';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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
                const res = await axios.get(`${path}/exam-archives/${archiveId}`);
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
        doc.text(`Exam Results for ${archive.exam_title}`, 14, 15);
        doc.text(`Course: ${archive.course_title}`, 14, 22);
        doc.text(`Date: ${format(new Date(archive.exam_date), 'PPP')}`, 14, 29);

        autoTable(doc, {
            startY: 35,
            head: [['Full Name', 'Candidate No.', 'Score', 'Submission Time']],
            body: sortedAndFilteredResults.map(result => [
                result.full_name,
                result.candidate_no,
                result.score,
                format(new Date(result.submission_time), 'Pp')
            ]),
        });

        doc.save(`exam-results-${archive.exam_title}.pdf`);
    };

    const handleDownloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            sortedAndFilteredResults.map(result => ({
                'Full Name': result.full_name,
                'Candidate No.': result.candidate_no,
                'Score': result.score,
                'Submission Time': format(new Date(result.submission_time), 'Pp')
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
        XLSX.writeFile(workbook, `exam-results-${archive.exam_title}.xlsx`);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-6 flex-shrink-0 border-r border-gray-200">
                 <div className="flex items-center mb-10">
                    <img src="/assets/logo.webp" alt="School Logo" className="h-10 w-10 mr-3" />
                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                </div>
                <nav className="space-y-2">
                    <Link to={`/admin-dashboard/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaListAlt className="mr-3" /> Dashboard
                    </Link>
                    <Link to="/admin-sessions" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaCalendarAlt className="mr-3" /> Sessions
                    </Link>
                    <Link to={`/admin-students/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaUsers className="mr-3" /> Students
                    </Link>
                    <Link to="/admin-instructors" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaChalkboardTeacher className="mr-3" /> Instructors
                    </Link>
                    <Link to="/exam-archives" className="flex items-center p-3 bg-blue-500 text-white rounded-lg">
                        <FaBook className="mr-3" /> Exam Archives
                    </Link>
                </nav>
                <div className="absolute bottom-6 left-6 right-6 w-52">
                     <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaCog className="mr-3" /> Settings
                    </Link>
                    <Link to="/admin-login" className="flex items-center p-3 mt-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <FaSignOutAlt className="mr-3" /> Logout
                    </Link>
                </div>
            </aside>

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

                {loading ? <p>Loading...</p> : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border">
                            <div><span className="font-semibold">Exam:</span> {archive.exam_title}</div>
                            <div><span className="font-semibold">Course:</span> {archive.course_title}</div>
                            <div><span className="font-semibold">Date:</span> {format(new Date(archive.exam_date), 'PPP')}</div>
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
                                        <SortableHeader name="score">Score</SortableHeader>
                                        <SortableHeader name="submission_time">Submission Time</SortableHeader>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginatedResults.map((result, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">{result.full_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{result.candidate_no}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{result.score}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{format(new Date(result.submission_time), 'Pp')}</td>
                                        </tr>
                                    ))}
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
                )}
            </main>
        </div>
    );
};

export default ExamArchiveDetail;