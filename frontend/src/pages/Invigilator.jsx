import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";
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

    if (data == "no exam activated" || data.examAssigned == false) {
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
            <div className="col-span-5 p-5">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Welcome back, {data?.Invigilator?.full_name}
                        </h1>
                        <div className="space-y-1">
                            <p className="text-gray-600">
                                Current Exam: <span className="font-semibold">{currentExam?.course || 'No Active Exam'}</span>
                            </p>
                            
                            
                        </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg shadow-sm md:flex items-center gap-2">
                        <p className="text-sm font-medium text-blue-800">Total Students:</p>
                        <p className="text-2xl font-bold text-blue-900">{students?.length || 0}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Student Check-in Management</h2>
                                <p className="text-sm text-gray-600">Monitor and manage student attendance for the exam</p>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Dialog */}
                    <div id="confirmDialog" className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden" style={{zIndex: 1000}}>
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3 text-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Confirm Check-in</h3>
                                <div className="mt-2 px-7 py-3">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to check in this student?
                                    </p>
                                </div>
                                <div className="items-center px-4 py-3">
                                    <button
                                        id="confirmBtn"
                                        className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        id="cancelBtn"
                                        className="px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md w-24 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Full Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Candidate Number
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Programme
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Login Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Check-in Time
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Check-out Time
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentStudents.map((student, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-blue-50 transition-colors duration-200"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {student.full_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {student.candidate_no}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {student.department}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {student.programme}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    student.is_logged_on === "yes"
                                                        ? "bg-green-100 text-green-800 ring-2 ring-green-50"
                                                        : "bg-red-100 text-red-800 ring-2 ring-red-50"
                                                }`}
                                            >
                                                {student.is_logged_on === "yes" ? (
                                                    "Logged In"
                                                ) : (
                                                    <span>Not Logged In</span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {student.checkin_time || 
                                                <span className="text-gray-400 italic">Not checked in</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {student.checkout_time || 
                                                <span className="text-gray-400 italic">Not checked out</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {student.checkin_time !== null ? (
                                                <div className="flex justify-center">
                                                    <FaCheck className="text-green-500 text-lg" />
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        const dialog = document.getElementById('confirmDialog');
                                                        const confirmBtn = document.getElementById('confirmBtn');
                                                        const cancelBtn = document.getElementById('cancelBtn');
                                                        
                                                        dialog.classList.remove('hidden');
                                                        
                                                        confirmBtn.onclick = () => {
                                                            handleCheck(student.id);
                                                            dialog.classList.add('hidden');
                                                        };
                                                        
                                                        cancelBtn.onclick = () => {
                                                            dialog.classList.add('hidden');
                                                        };
                                                    }}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-1.5 transition-colors duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                                                >
                                                    Check
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm ${
                                        currentPage === 1
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                    }`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm ${
                                        currentPage === totalPages
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing{" "}
                                        <span className="font-semibold text-gray-900">
                                            {indexOfFirstStudent + 1}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-semibold text-gray-900">
                                            {Math.min(
                                                indexOfLastStudent,
                                                filteredStudents?.length || 0
                                            )}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-semibold text-gray-900">
                                            {filteredStudents?.length || 0}
                                        </span>{" "}
                                        results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        {Array.from(
                                            { length: totalPages },
                                            (_, i) => i + 1
                                        ).map((number) => (
                                            <button
                                                key={number}
                                                onClick={() => paginate(number)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                                                    currentPage === number
                                                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600 hover:bg-blue-100"
                                                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                }`}
                                            >
                                                {number}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </GridLayout>
    );
};

export default Invigilator;
