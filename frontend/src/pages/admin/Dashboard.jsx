import { FaEye, FaPenToSquare } from "react-icons/fa6";
import Sidebar from "../../components/Sidebar";
import Student from "../Student";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { path } from "../../../utils/path";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import Model from "../../components/Model";
import FormBtn from "../../components/FormBtn";

const AdminDashboard = () => {
    const { id } = useParams();
    // const { data: exams, loading, err } = useFetch(`/get-exams`);
    const [course, setCourse] = useState();
    const [exams, setExams] = useState();
    const [loading, setLoading] = useState(false);
    const [showModel, setshowModel] = useState(false);
    const [showDeleteModel, setShowDeleteModel] = useState(false);
    const [showTerminateModel, setShowTerminateModel] = useState(false);
    const [showSubmitModel, setShowSubmitModel] = useState(false);
    const [examId, setexamId] = useState();

    const [courses, setCourses] = useState();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const res = await axios(`${path}/get-exams`);
            setExams(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchExams();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios(`${path}/get-courses`);
            setCourses(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);
    console.log(courses);

    const showModelAndSetExamId = (id) => {
        console.log(id)
        setShowSubmitModel(true);
        setexamId(id);
    };

    const handleActivateExam = async (id) => {
        console.log(id);
        try {
            const res = await axios.post(`${path}/activate-exam/${id}`);
            if (res.status == 200) {
                setShowSubmitModel(false);
                fetchExams();
            }
            console.log(res);
        } catch (err) {
            console.log(err);
        }
    };

    const handleTerminateExam = async (id) => {
        console.log(id);
        try {
            const res = await axios.post(`${path}/terminate-exam/${id}`);
            if (res.status == 200) {
                fetchExams();
                setShowTerminateModel(false);
            }
            console.log(res);
        } catch (err) {
            console.log(err);
        }
    };

    // Filter exams based on search
    const filteredExams = exams?.filter((exam) => {
        const courseName = courses?.find(course => course.id === exam.course_id)?.title || '';
        return courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.exam_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.exam_duration.toString().includes(searchTerm);
    });

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredExams?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((filteredExams?.length || 0) / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="grid grid-cols-6 gap-4 min-h-screen">
            <Sidebar>
                <Link to={"/admin-sessions"} className="flex items-center gap-2 p-3 hover:bg-gray-100 hover:text-black rounded-lg">
                    <i className="fas fa-clock"></i>
                    <span>Sessions</span>
                </Link>
                <Link to={"/admin-instructors"} className="flex items-center gap-2 p-3 hover:bg-gray-100 hover:text-black rounded-lg">
                    <i className="fas fa-chalkboard-teacher"></i>
                    <span>Instructors</span>
                </Link>
                <Link to={`/admin-students/${id}`} className="flex items-center gap-2 p-3 hover:bg-gray-100 hover:text-black rounded-lg">
                    <i className="fas fa-user-graduate"></i>
                    <span>Students</span>
                </Link>
                {/* <Link to={`/admin-courses/${id}`}>courses</Link> */}
            </Sidebar>
            <div className="col-span-5 p-5">
                <div className="flex justify-between items-center w-full mb-4 bg-white p-6 rounded-lg shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Exams Dashboard</h1>
                        <p className="text-gray-600 mt-1">Manage and monitor exam details</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-[300px] py-2 px-4 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="Search by course, duration or type..."
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                        
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                            <i className="fas fa-filter"></i>
                        </button>

                        <div className="flex items-center gap-3 border-l pl-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <i className="fas fa-user text-gray-600"></i>
                            </div>
                            <div className="relative">
                                <button className="hover:bg-gray-100 p-2 rounded-lg">
                                    <i className="fas fa-chevron-down text-gray-600"></i>
                                </button>
                                <div id="logout" className="hidden absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100">
                                    <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50">
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                <span className="ml-2">Loading...</span>
                            </div>
                        ) : currentItems && currentItems.length > 0 ? (
                            <>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Course Details
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Questions
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Scoring
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Exam Info
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status & Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentItems.map((exam, index) => (
                                            <tr key={exam.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {indexOfFirstItem + index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {courses && courses.map(course => 
                                                            course.id === exam.course_id ? course.title : ""
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        <div>Total: {exam.no_of_questions}</div>
                                                        <div className="text-gray-500">Actual: {exam.actual_questions}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        <div>Max Score: {exam.max_score}</div>
                                                        <div className="text-gray-500">Per Question: {exam.marks_per_question}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        <div>Type: {exam.exam_type}</div>
                                                        <div className="text-gray-500">Duration: {exam.exam_duration}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center gap-4">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            exam.activated === "yes" 
                                                            ? "bg-green-100 text-green-800" 
                                                            : "bg-red-100 text-red-800"
                                                        }`}>
                                                            {exam.activated === "yes" ? "Active" : "Inactive"}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => showModelAndSetExamId(exam.id)}
                                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                            >
                                                                Activate
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setexamId(exam.id)
                                                                    setShowTerminateModel(true)
                                                                }}
                                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                            >
                                                                Terminate
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination Controls */}
                                <div className="flex justify-center items-center gap-2 mt-4">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1 rounded ${
                                            currentPage === 1
                                                ? 'bg-gray-200 cursor-not-allowed'
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                    >
                                        Previous
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index + 1}
                                            onClick={() => paginate(index + 1)}
                                            className={`px-3 py-1 rounded ${
                                                currentPage === index + 1
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 hover:bg-gray-300'
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                    
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1 rounded ${
                                            currentPage === totalPages
                                                ? 'bg-gray-200 cursor-not-allowed'
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>

                                {/* Items per page info */}
                                <div className="text-center text-sm text-gray-600 mt-2">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredExams?.length || 0)} of {filteredExams?.length || 0} entries
                                </div>
                            </>
                        ) : (
                            <p className="text-center py-4">No exams found</p>
                        )}
                    </div>
                </div>
            </div>
            {showSubmitModel && (
                <Model>
                    <div className="bg-white rounded-lg p-6  w-full">
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold text-gray-800">Activate Exam</h2>
                            <p className="text-gray-600 mt-2">Are you sure you want to activate this exam?</p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => handleActivateExam(examId)}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Yes, Activate
                            </button>
                            <button 
                                onClick={() => setShowSubmitModel(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Model>
            )}
            {showTerminateModel && (
                <Model>
                    <div className="p-5 text-center">
                        <h1 className="text-xl font-bold capitalize my-6">
                            Did you want to terminate this exam
                        </h1>
                        <div className="flex justify-center gap-5">
                            <button
                                className="px-4 py-2 bg-green-500 text-white"
                                onClick={() =>
                                    handleTerminateExam(examId)
                                }
                            >
                                Yes
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white"
                                onClick={() =>
                                    setShowTerminateModel(false)
                                }
                            >
                                No
                            </button>
                        </div>
                    </div>
                </Model>
            )}
        </div>
    );
};

export default AdminDashboard;
