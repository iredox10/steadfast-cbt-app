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
        try {
            const res = await axios(`${path}/get-exams`);
            setExams(res.data);
        } catch (err) {
            console.log(err);
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
                <Link to={"/admin-sessions"}>Sessions</Link>
                <Link to={"/admin-instructors"}>instructors</Link>
                <Link to={`/admin-students/${id}`}>students</Link>
                {/* <Link to={`/admin-courses/${id}`}>courses</Link> */}
            </Sidebar>
            <div className="col-span-5 p-5">
                <div className="flex justify-between  w-full my-5">
                    <div>
                        <h1 className="text-2xl font-bold">Exams</h1>
                        <p>exam details</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white flex items-center gap-3 p-2 rounded-full">
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-1 border-none outline-none px-5"
                                placeholder=" course name,duration,type" 
                            />
                            <button>
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                        <i className="fas fa-filter"></i>
                        <div className="flex gap-4 items-center">
                            {/* {{-- <img src="" alt="profile picture" className=""> --}} */}
                            <i className="fas fa-user text-2xl border-2 border-black p-2 rounded-full"></i>
                            <button className="transition ease-in-out delay-75 p-1 arrow relative hover:mt-2">
                                <i className="fas fa-arrow-down"></i>
                                <button
                                    id="logout"
                                    className="hidden absolute top-[5rem] -right-0 p-2  h-10 bg-white shadow-lg"
                                >
                                    logout
                                </button>
                            </button>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        {currentItems && currentItems.length > 0 ? (
                            <>
                                <table className="min-w-full border-collapse overflow-hidden rounded-lg">
                                    <thead>
                                        <tr className="bg-gray-100 ">
                                            <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tl-lg">
                                                Id
                                            </th>
                                            <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                                Course
                                            </th>
                                            <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                                Number Of Questions
                                            </th>
                                            <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                                Acutal Question
                                            </th>

                                            <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                                Max score
                                            </th>
                                            <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                                Marks Per Question
                                            </th>
                                            <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                                Exam Type
                                            </th>
                                            <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                                Exam Duration
                                            </th>
                                            <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                                Is Activated
                                            </th>
                                            <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tr-lg">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((exam, index) => (
                                            <tr className="border-b" key={exam.id}>
                                                <td className="py-3 px-4 text-gray-700">
                                                    {indexOfFirstItem + index + 1}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                    {courses &&
                                                        courses.map(
                                                            (course) => {
                                                                if (
                                                                    course.id ==
                                                                    exam.course_id
                                                                ) {
                                                                    return (
                                                                        <p>
                                                                            {
                                                                                course.title
                                                                            }
                                                                        </p>
                                                                    );
                                                                } else {
                                                                    return "";
                                                                }
                                                            }
                                                        )}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                    {exam.no_of_questions}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                    {exam.actual_questions}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                    {exam.max_score}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                    {exam.marks_per_question}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                    {exam.exam_type}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                    {exam.exam_duration}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                    {exam.activated == "yes" ? (
                                                        <button className="p-1 bg-green-700 rounded-full">
                                                            <FaCheck className="text-white" />
                                                        </button>
                                                    ) : (
                                                        <button className="p-1 bg-red-500 rounded-full">
                                                            <FaTimes className="text-white" />
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 flex items-center text-gray-700 gap-2">
                                                    <button
                                                        id="show_detail"
                                                        className="p-2 bg-green-600"
                                                        onClick={() =>
                                                            showModelAndSetExamId(
                                                                exam.id
                                                            )
                                                        }
                                                    >
                                                        {/* <FaCheck /> */}
                                                        Activate
                                                    </button>
                                                    <button
                                                        type="button"
                                                        id="show_detail"
                                                        className="p-2 bg-red-500 text-white"
                                                        onClick={() =>{
                                                            setexamId(exam.id)
                                                            setShowTerminateModel(
                                                                true
                                                            )
                                                        }
                                                        }
                                                    >
                                                        {/* <FaCheck /> */}
                                                        Terminate
                                                    </button>
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
                    <div className="p-4 text-center">
                        <h1 className="text-2xl font-bold">
                            Did you want to activate{" "}
                        </h1>
                        <div className="flex justify-center items-center gap-10">
                            <button onClick={() => handleActivateExam(examId)}>
                                Yes
                            </button>
                            <button onClick={() => setShowSubmitModel(false)}>
                                No
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
