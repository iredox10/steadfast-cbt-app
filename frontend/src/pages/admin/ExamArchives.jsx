import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaCalendarAlt, FaBook, FaChalkboardTeacher, FaCog, FaSignOutAlt, FaListAlt, FaSearch, FaUsers } from "react-icons/fa";
import { path } from "../../../utils/path";
import { format } from 'date-fns';

const ExamArchives = () => {
    const { userId } = useParams();
    const [archives, setArchives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const archivesPerPage = 10;

    const fetchArchives = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${path}/exam-archives`, { headers });
            setArchives(res.data);
        } catch (err) {
            console.error("Error fetching archives:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArchives();
    }, []);

    const filteredArchives = useMemo(() =>
        archives.filter(archive =>
            archive.exam_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            archive.course_title.toLowerCase().includes(searchTerm.toLowerCase())
        ), [archives, searchTerm]);

    const paginatedArchives = useMemo(() => {
        const startIndex = (currentPage - 1) * archivesPerPage;
        return filteredArchives.slice(startIndex, startIndex + archivesPerPage);
    }, [filteredArchives, currentPage]);

    const totalPages = Math.ceil(filteredArchives.length / archivesPerPage);

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-6 flex-shrink-0 border-r border-gray-200">
                <div className="flex items-center mb-10">
                    <img src="/assets/buk.png" alt="School Logo" className="h-10 w-10 mr-3" />
                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                </div>
                <nav className="space-y-2">
                    <Link to={`/dashboard/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaListAlt className="mr-3" /> Dashboard
                    </Link>
                    <Link to="/admin-sessions" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaCalendarAlt className="mr-3" /> Sessions
                    </Link>
                    <Link to={`/admin-students/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaUsers className="mr-3" /> Students
                    </Link>
                    <Link to={`/admin-instructors/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Exam Archives</h2>
                        <p className="text-gray-500">Browse and review past examination records.</p>
                    </div>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative mb-4">
                        <FaSearch className="absolute top-3 left-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by exam or course title..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full"
                        />
                    </div>
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedArchives.map(archive => (
                                <tr key={archive.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{archive.exam_title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{archive.course_title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{format(new Date(archive.exam_date), 'PPP')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{archive.duration} mins</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/exam-archives/${archive.id}`} className="text-blue-500 hover:underline">View Details</Link>
                                    </td>
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
            </main>
        </div>
    );
};

export default ExamArchives;
