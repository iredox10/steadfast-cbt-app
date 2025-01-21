import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { path } from "../../../utils/path";
import Sidebar from "../../components/Sidebar";

const ExamArchiveDetail = () => {
    const { archiveId } = useParams();
    const [archive, setArchive] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    useEffect(() => {
        const fetchArchiveDetails = async () => {
            try {
                const response = await axios.get(`${path}/exam-archives/${archiveId}`);
                setArchive(response.data);
                console.log("Archive data:", response.data); // Debug log
            } catch (error) {
                console.error("Error fetching archive details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArchiveDetails();
    }, [archiveId]);

    const sortResults = (key) => {
        setSortConfig((current) => {
            const direction = current.key === key && current.direction === 'asc' ? 'desc' : 'asc';
            return { key, direction };
        });
    };

    const getFilteredAndSortedResults = () => {
        if (!archive?.student_results) return [];

        let results = [...archive.student_results];

        // Filter results
        results = results.filter(student => 
            student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.candidate_no.toString().includes(searchTerm.toLowerCase())
        );

        // Sort results
        if (sortConfig.key) {
            results.sort((a, b) => {
                let compareA = a[sortConfig.key];
                let compareB = b[sortConfig.key];

                // Handle numeric values
                if (sortConfig.key === 'score') {
                    compareA = parseFloat(compareA) || 0;
                    compareB = parseFloat(compareB) || 0;
                }

                if (compareA < compareB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (compareA > compareB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return results;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Loading...</span>
            </div>
        );
    }

    if (!archive) {
        return (
            <div className="text-center py-8">
                Archive not found or error loading data
            </div>
        );
    }

    const results = getFilteredAndSortedResults();

    return (
        <div className="grid grid-cols-6 gap-4 min-h-screen">
            <Sidebar>
                {/* Your existing sidebar links */}
            </Sidebar>
            <div className="col-span-5 p-5">
                <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Header with back button */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <Link 
                                to="/exam-archives" 
                                className="text-blue-500 hover:text-blue-700 mb-4 inline-block"
                            >
                                ← Back to Archives
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-800 mt-2">
                                {archive.exam_title}
                            </h1>
                        </div>
                    </div>

                    {/* Exam Details */}
                    <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <span className="font-semibold">Course:</span>{" "}
                            {archive.course_title}
                        </div>
                        <div>
                            <span className="font-semibold">Date:</span>{" "}
                            {new Date(archive.exam_date).toLocaleDateString()}
                        </div>
                        <div>
                            <span className="font-semibold">Duration:</span>{" "}
                            {archive.duration} minutes
                        </div>
                    </div>

                    {/* Search and Results Count */}
                    <div className="flex justify-between items-center mb-4">
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 py-2 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="Search students..."
                        />
                        <div className="text-gray-600">
                            Total Results: {results.length}
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => sortResults('candidate_no')}
                                    >
                                        Candidate No
                                        {sortConfig.key === 'candidate_no' && (
                                            <span className="ml-1">
                                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => sortResults('full_name')}
                                    >
                                        Full Name
                                        {sortConfig.key === 'full_name' && (
                                            <span className="ml-1">
                                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => sortResults('score')}
                                    >
                                        Score
                                        {sortConfig.key === 'score' && (
                                            <span className="ml-1">
                                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => sortResults('submission_time')}
                                    >
                                        Submission Time
                                        {sortConfig.key === 'submission_time' && (
                                            <span className="ml-1">
                                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.length > 0 ? (
                                    results.map((result, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {result.candidate_no}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {result.full_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {result.score}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {result.submission_time 
                                                    ? new Date(result.submission_time).toLocaleString()
                                                    : 'Not submitted'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                            No results found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamArchiveDetail; 