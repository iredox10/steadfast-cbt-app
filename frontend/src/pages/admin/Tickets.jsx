import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import ViewTicketsModal from '../../components/ViewTicketsModal';
import { 
    FaClock, 
    FaChalkboardTeacher, 
    FaUserGraduate, 
    FaTicketAlt,
    FaSearch,
    FaEye,
    FaBook
} from 'react-icons/fa';
import { path } from '../../../utils/path';

const Tickets = () => {
    const { id } = useParams();
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showTicketsModal, setShowTicketsModal] = useState(false);
    const [selectedExamForTickets, setSelectedExamForTickets] = useState(null);

    useEffect(() => {
        fetchExamsAndCourses();
    }, []);

    const fetchExamsAndCourses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Fetch both exams and courses
            const [examsResponse, coursesResponse] = await Promise.all([
                axios.get(`${path}/get-exams`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${path}/get-courses`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            // Filter only active exams (those with activated status)
            const activeExams = examsResponse.data.filter(exam => exam.activated === 'yes');
            setExams(activeExams);
            setCourses(coursesResponse.data);
            setError('');
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleViewTickets = (exam) => {
        setSelectedExamForTickets(exam);
        setShowTicketsModal(true);
    };

    const getCourseName = (exam) => {
        if (!exam) return 'Unknown Course';
        
        // If course is already loaded in the exam object
        if (exam.course) {
            const code = exam.course.code || '';
            const title = exam.course.title || '';
            if (code && title) return `${code} - ${title}`;
            if (title) return title;
            if (code) return code;
        }

        const course = courses.find(c => c.id === parseInt(exam.course_id));
        if (!course) return 'Unknown Course';
        
        // Course model fields are: code, title, credit_unit
        const code = course.code || '';
        const title = course.title || '';
        
        if (code && title) {
            return `${code} - ${title}`;
        } else if (title) {
            return title;
        } else if (code) {
            return code;
        }
        return 'Unknown Course';
    };

    const filteredExams = exams.filter(exam => {
        const courseName = getCourseName(exam).toLowerCase();
        const examTitle = (exam.title || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return courseName.includes(search) || 
               examTitle.includes(search) ||
               exam.id.toString().includes(search) ||
               (exam.invigilator && exam.invigilator.toLowerCase().includes(search));
    });

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar userId={id} />

            <div className="flex-1 p-6">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Exam Tickets
                            </h1>
                            <p className="text-gray-600 mt-1">
                                View and manage tickets for active exams
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-6">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by exam ID or course name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* No Active Exams */}
                {!loading && !error && filteredExams.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <FaTicketAlt className="mx-auto text-6xl text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No Active Exams
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm 
                                ? 'No exams match your search criteria.'
                                : 'There are currently no active exams with tickets.'}
                        </p>
                    </div>
                )}

                {/* Exams Grid */}
                {!loading && !error && filteredExams.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredExams.map((exam) => (
                            <div
                                key={exam.id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                            >
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                                    <div className="flex items-center justify-between text-white">
                                        <div className="flex items-center gap-2">
                                            <FaBook className="text-xl" />
                                            <span className="font-semibold truncate">
                                                {exam.title || getCourseName(exam) || `Exam #${exam.id}`}
                                            </span>
                                        </div>
                                        <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium whitespace-nowrap ml-2">
                                            Active
                                        </span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4">
                                    {/* Course Name */}
                                    <p className="font-bold text-gray-900 mb-4 line-clamp-2 text-base">
                                        {getCourseName(exam)}
                                    </p>
                                    
                                    <div className="space-y-2 mb-4">
                                        {/* Duration */}
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FaClock className="text-gray-400" />
                                            <span>Duration: {exam.exam_duration || 'N/A'} minutes</span>
                                        </div>
                                        
                                        {/* Invigilator */}
                                        {exam.invigilator && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FaChalkboardTeacher className="text-gray-400" />
                                                <span className="truncate">Invigilator: {exam.invigilator}</span>
                                            </div>
                                        )}
                                        
                                        {/* Activation Date */}
                                        {exam.activated_date && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FaClock className="text-gray-400" />
                                                <span>Activated: {new Date(exam.activated_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* View Tickets Button */}
                                    <button
                                        onClick={() => handleViewTickets(exam)}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium"
                                    >
                                        <FaEye />
                                        <span>View Tickets</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary Section */}
                {!loading && !error && filteredExams.length > 0 && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <FaTicketAlt className="text-blue-600 mt-1" />
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-1">
                                    About Exam Tickets
                                </h4>
                                <p className="text-sm text-blue-800">
                                    Click "View Tickets" on any active exam to see available tickets, 
                                    assigned tickets, and student login status. You can search, filter, 
                                    copy ticket numbers, and export data to CSV.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* View Tickets Modal */}
            {showTicketsModal && selectedExamForTickets && (
                <ViewTicketsModal
                    examId={selectedExamForTickets.id}
                    courseName={getCourseName(selectedExamForTickets)}
                    onClose={() => {
                        setShowTicketsModal(false);
                        setSelectedExamForTickets(null);
                    }}
                />
            )}
        </div>
    );
};

export default Tickets;
