import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { path } from "../../../utils/path";
import { format } from 'date-fns';
import AdminSidebar from "../../components/AdminSidebar";

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

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar userId={userId} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <AdminSidebar userId={userId} />

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

                    {archives.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="flex flex-col items-center justify-center text-gray-400">
                                <FaSearch className="text-5xl mb-4 text-gray-200" />
                                <h3 className="text-lg font-medium text-gray-900">No Archives Found</h3>
                                <p className="text-gray-500 max-w-sm mt-1">
                                    There are no exam archives available at the moment.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activated By</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terminated By</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paginatedArchives.length > 0 ? (
                                            paginatedArchives.map(archive => (
                                                <tr key={archive.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">{archive.exam_title}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{archive.course_title}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{format(new Date(archive.exam_date), 'PPP')}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-medium text-gray-900">{archive.activated_by_name || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-medium text-gray-900">{archive.terminated_by_name || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Link to={`/exam-archives/${archive.id}`} className="text-blue-500 hover:underline">View Details</Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                    No matching archives found for "{searchTerm}"
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {paginatedArchives.length > 0 && (
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
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ExamArchives;
