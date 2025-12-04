import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { path } from "../../../utils/path";
import Sidebar from "../../components/Sidebar";
import { FaTachometerAlt, FaBook, FaSearch, FaChartBar, FaUsers, FaEye, FaFileAlt } from "react-icons/fa";
import { format } from "date-fns";

const CourseResults = () => {
    const { userId, courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [archives, setArchives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        fetchCourse();
        fetchCourseArchives();
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

    const fetchCourseArchives = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            
            // 1. Get exams for this course to get their IDs
            // We need to know which exams belong to this course to filter the archives
            const examsRes = await axios.get(`${path}/get-exams/${userId}/${courseId}`, { headers });
            const courseExamIds = examsRes.data.map(exam => exam.id);
            
            console.log("Course Exam IDs:", courseExamIds);

            // 2. Get all exam archives
            const archivesRes = await axios.get(`${path}/exam-archives`, { headers });
            
            // 3. Filter archives that belong to one of the course's exams
            const courseArchives = archivesRes.data.filter(archive => 
                courseExamIds.includes(archive.exam_id)
            );
            
            console.log("Filtered Course Archives:", courseArchives);
            setArchives(courseArchives);
            
        } catch (err) {
            console.error("Error fetching archives:", err);
            setError("Failed to load exam archives");
        } finally {
            setLoading(false);
        }
    };

    const filteredArchives = archives.filter(archive => {
        const searchLower = searchTerm.toLowerCase();
        return (
            archive.exam_title?.toLowerCase().includes(searchLower) ||
            archive.exam_type?.toLowerCase().includes(searchLower)
        );
    });

    const handleViewDetails = (archive) => {
        // Always navigate to the instructor's results detail page
        // Use exam_id if available (which it should be for both generated and fetched archives)
        navigate(`/exam-results-detail/${userId}/${courseId}/${archive.exam_id || archive.id}`);
    };

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
                            <h1 className="text-3xl font-bold text-gray-900">Exam Archives</h1>
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

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by exam title or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Archives List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Loading exam archives...</p>
                        </div>
                    ) : filteredArchives.length === 0 ? (
                        <div className="text-center py-12">
                            <FaFileAlt className="text-gray-300 text-5xl mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Exam Archives Found</h3>
                            <p className="text-gray-600">
                                {archives.length === 0 
                                    ? "There are no terminated exams for this course yet."
                                    : "No archives match your search criteria."
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Exam Title
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Students
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Questions
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredArchives.map((archive) => (
                                        <tr key={archive.id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                                {archive.exam_title || 'N/A'}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    archive.status === 'Active' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {archive.exam_type || archive.exam?.exam_type || 'N/A'}
                                                    {archive.status ? ` (${archive.status})` : ''}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {archive.exam_date 
                                                    ? format(new Date(archive.exam_date), 'MMM dd, yyyy')
                                                    : 'N/A'
                                                }
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {archive.duration ? `${archive.duration} mins` : 'N/A'}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {archive.student_results?.length || 0}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {archive.total_questions || 'N/A'}
                                            </td>
                                            <td className="py-4 px-6 text-sm">
                                                <button
                                                    onClick={() => handleViewDetails(archive)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                >
                                                    <FaEye />
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CourseResults;
