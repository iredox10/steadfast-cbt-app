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

    const [students, setStudents] = useState();
    const fetch = async () => {
        try {
            const res = await axios(`${path}/get-students`);
            setStudents(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const [studentsPerPage] = useState(8);

    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = students
        ? students.slice(indexOfFirstStudent, indexOfLastStudent)
        : [];
    const totalPages = students
        ? Math.ceil(students.length / studentsPerPage)
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
                        <h1 className="text-2xl font-bold text-gray-800 capitalize">
                            {/* Welcome back {data && data.Invigilator.full_name} */}
                        </h1>
                        <p className="text-gray-600">
                            Manage and Check in Student
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Full Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Candidate Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Programme
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Login Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Check-in Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Check-out Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentStudents.map((student, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {student.full_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.candidate_no}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.department}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.programme}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    student.is_logged_on ===
                                                    "yes"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {student.is_logged_on ===
                                                "yes" ? (
                                                    "Logged In"
                                                ) : (
                                                    <span> - </span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.checkin_time ||
                                                "Not checked in"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.checkout_time ||
                                                "Not checked out"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.checkin_time !== null ? (
                                                <div className="flex justify-center">
                                                    <FaCheck className="" />
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        handleCheck(student.id)
                                                    }
                                                    className="bg-blue-500 text-white rounded-lg px-4 py-1"
                                                >
                                                    Check
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                        currentPage === 1
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                        currentPage === totalPages
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing{" "}
                                        <span className="font-medium">
                                            {indexOfFirstStudent + 1}
                                        </span>{" "}
                                        -{" "}
                                        <span className="font-medium">
                                            {Math.min(
                                                indexOfLastStudent,
                                                students?.length || 0
                                            )}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-medium">
                                            {students?.length || 0}
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
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    currentPage === number
                                                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
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
                {students ? (
                    ""
                ) : (
                    <div className="grid place-content-center text-8xl">
                        <div className="flex flex-col items-center text-gray-400">
                            <FaExclamationTriangle className="text-[15rem] mt-[4rem]" />
                            <p>No Exam Assign</p>
                        </div>
                    </div>
                )}
            </div>
        </GridLayout>
    );
};

export default Invigilator;
