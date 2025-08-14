import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { 
  FaCheck, 
  FaExclamationTriangle, 
  FaSearch, 
  FaUser, 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaClock, 
  FaTimes
} from "react-icons/fa";
import GridLayout from "../components/GridLayout";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { path } from "../../utils/path";

const Invigilator = () => {
    const { id } = useParams();
    const { data, loading, error } = useFetch(`/get-invigilator/${id}`);
    const [currentExam, setCurrentExam] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [students, setStudents] = useState();
    const fetch = async () => {
        try {
            const res = await axios(`${path}/get-students`);
            setStudents(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchCurrentExam = async () => {
        try {
            const res = await axios(`${path}/get-current-exam`);
            setCurrentExam(res.data);
            console.log(res.data)
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetch();
        fetchCurrentExam();
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const [studentsPerPage] = useState(8);

    // Filter students based on search term
    const filteredStudents = students?.filter(student => 
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.candidate_no.toString().includes(searchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.programme.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = filteredStudents
        ? filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent)
        : [];
    const totalPages = filteredStudents
        ? Math.ceil(filteredStudents.length / studentsPerPage)
        : 0;

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleCheck = async (id) => {
        try {
            const checkStdRes = await axios.post(`${path}/check-student/${id}`);
            console.log(checkStdRes);
            fetch();
            console.log(students);
        } catch (err) {
            console.log(err);
        }
    };

    if (loading) {
        return (
            <GridLayout>
                <Sidebar />
                <div className="col-span-5 p-5">
                    <div className="flex flex-col items-center text-gray-400">
                        <p className="text-2xl font-bold">Loading...</p>
                    </div>
                </div>
            </GridLayout>
        );
    }

    if (error) {
        return (
            <GridLayout>
                <Sidebar />
                <div className="col-span-5 p-5">
                    <div className="flex flex-col items-center text-gray-400">
                         <FaExclamationTriangle className="text-[30rem] " />
                        <p className="text-2xl font-bold">An error occurred</p>
                    </div>
                </div>
            </GridLayout>
        );
    }

    if (!data || data === "no exam activated" || data.examAssigned === false) {
        return (
            <GridLayout>
            <Sidebar />
            <div className="col-span-5 p-5">
                <div className="flex flex-col items-center text-gray-400">
                    <FaExclamationTriangle className="text-[30rem] " />
                    <p className="text-2xl font-bold">No Exam Assign To You</p>
                </div></div>
            </GridLayout>
        );
    }


    return (
        <GridLayout>
            <Sidebar />
            <div className="col-span-5 p-5 bg-gray-50 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Welcome back, {data?.Invigilator?.full_name}
                        </h1>
                        <p className="text-gray-500">
                            Invigilating: <span className="font-semibold text-blue-600">{currentExam?.course || 'No Active Exam'}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-3">
                            <p className="text-sm font-medium text-gray-600">Total Students:</p>
                            <p className="text-3xl font-bold text-blue-600">{students?.length || 0}</p>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name, ID, dept..."
                                className="w-64 pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="absolute top-3 left-3 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Student Check-in</h2>
                    
                    {/* Confirmation Dialog */}
                    <div id="confirmDialog" className="fixed inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center z-50 hidden">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-95">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Check-in</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to check in this student?</p>
                            <div className="flex justify-end gap-4">
                                <button
                                    id="cancelBtn"
                                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    id="confirmBtn"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentStudents.map((student, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 transform hover:scale-105 transition-transform duration-300">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FaGraduationCap className="text-blue-600" />
                                </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{student.full_name}</h3>
                                        <p className="text-sm text-gray-500">{student.candidate_no}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-semibold">Dept:</span> {student.department}</p>
                                    <p><span className="font-semibold">Prog:</span> {student.programme}</p>
                                    <div className="flex items-center">
                                        <span className="font-semibold mr-2">Status:</span>
                                        <span
                                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                student.is_logged_on === "yes"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {student.is_logged_on === "yes" ? "Logged In" : "Not Logged In"}
                                        </span>
                                    </div>
                                    <p><span className="font-semibold">Checked-in:</span> {student.checkin_time || "No"}</p>
                                    <p><span className="font-semibold">Checked-out:</span> {student.checkout_time || "No"}</p>
                                </div>
                                <div className="mt-5">
                                    {student.checkin_time ? (
                                        <div className="flex items-center justify-center text-green-500">
                                            <FaCheck className="mr-2" />
                                            <span>Checked In</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                const dialog = document.getElementById('confirmDialog');
                                                dialog.classList.remove('hidden');
                                                dialog.querySelector('#confirmBtn').onclick = () => {
                                                    handleCheck(student.id);
                                                    dialog.classList.add('hidden');
                                                };
                                                dialog.querySelector('#cancelBtn').onclick = () => {
                                                    dialog.classList.add('hidden');
                                                };
                                            }}
                                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                                        >
                                            Check In
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents?.length || 0)} of {filteredStudents?.length || 0} students
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </GridLayout>
    );
};

export default Invigilator;
