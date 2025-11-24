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
            
            // First, try to get exam archives
            const archivesRes = await axios.get(`${path}/exam-archives`, { headers });
            console.log("All archives:", archivesRes.data);
            
            // Filter archives for this specific course
            const courseArchives = archivesRes.data.filter(archive => 
                archive.course_id === parseInt(courseId)
            );
            
            // If no archives found, fetch terminated exams directly
            if (courseArchives.length === 0) {
                console.log("No archives found, fetching terminated exams...");
                const examsRes = await axios.get(`${path}/get-exams/${userId}/${courseId}`, { headers });
                
                // Get terminated exams (those with finished_time)
                const terminatedExams = examsRes.data.filter(exam => 
                    exam.finished_time !== null && exam.finished_time !== undefined
                );
                
                console.log("Terminated exams:", terminatedExams);
                
                // Convert exams to archive format for display
                const examArchives = await Promise.all(terminatedExams.map(async (exam) => {
                    try {
                        // Get questions count
                        const questionsRes = await axios.get(`${path}/get-questions/${exam.id}`, { headers });
                        const totalQuestions = questionsRes.data.length;
                        
                        // Get student scores
                        const scoresRes = await axios.get(`${path}/get-students-score/${courseId}`, { headers });
                        const studentCount = scoresRes.data.length;
                        
                        return {
                            id: exam.id,
                            exam_id: exam.id,
                            exam_title: exam.title || `${exam.exam_type} Exam`,
                            exam_type: exam.exam_type,
                            course_id: exam.course_id,
                            exam_date: exam.finished_time || exam.activated_date || exam.created_at,
                            duration: exam.exam_duration,
                            total_questions: totalQuestions,
                            student_results: scoresRes.data || [],
                            is_generated: true // Flag to indicate this is generated, not from archive table
                        };
                    } catch (err) {
                        console.error("Error processing exam:", exam.id, err);
                        return {
                            id: exam.id,
                            exam_id: exam.id,
                            exam_title: exam.title || `${exam.exam_type} Exam`,
                            exam_type: exam.exam_type,
                            course_id: exam.course_id,
                            exam_date: exam.finished_time || exam.created_at,
                            duration: exam.exam_duration,
                            total_questions: 0,
                            student_results: [],
                            is_generated: true
                        };
                    }
                }));
                
                console.log("Generated exam archives:", examArchives);
                setArchives(examArchives);
            } else {
                console.log("Course archives:", courseArchives);
                setArchives(courseArchives);
            }
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
        // If it's a real archive, navigate to archive detail
        if (!archive.is_generated) {
            navigate(`/exam-archive-detail/${userId}/${archive.id}`);
        } else {
            // If it's a generated view, navigate to a results detail page
            // For now, we'll create a simple results view
            navigate(`/exam-results-detail/${userId}/${courseId}/${archive.exam_id}`);
        }
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
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                    {archive.exam_type || 'N/A'}
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
