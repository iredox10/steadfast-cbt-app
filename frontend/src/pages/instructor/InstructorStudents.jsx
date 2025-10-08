import React, { useState, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { FaSearch, FaFilePdf, FaFileExcel } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";

const InstructorStudents = () => {
    const { userId, courseId } = useParams();
    
    const {
        data: scores,
        loading: scoresLoading,
        error: scoresError,
    } = useFetch(`/get-students-score/${courseId}`);
    
    const {
        data: students,
        loading: studentsLoading,
        error: studentsError,
    } = useFetch(`/get-students/${userId}/${courseId}`);
    
    const { data: course } = useFetch(`/get-course/${courseId}`);

    // Debug logging
    console.log("InstructorStudents Debug:", {
        userId,
        courseId,
        students,
        studentsLoading,
        studentsError,
        scores,
        scoresLoading,
        scoresError,
        course
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Combine student data with scores
    const studentsWithScores = students?.map(student => {
        const score = scores?.find(s => s.student_id === student.id);
        return {
            ...student,
            score: score?.score || "N/A"
        };
    }) || [];

    // Filter students based on search term
    const filteredStudents = studentsWithScores.filter(student => {
        const fullName = student.full_name?.toLowerCase() || "";
        const candidateNo = student.candidate_no?.toLowerCase() || "";
        const programme = student.programme?.toLowerCase() || "";
        const department = student.department?.toLowerCase() || "";
        const searchTermLower = searchTerm.toLowerCase();
        
        return (
            fullName.includes(searchTermLower) ||
            candidateNo.includes(searchTermLower) ||
            programme.includes(searchTermLower) ||
            department.includes(searchTermLower)
        );
    });

    // Calculate pagination values
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((filteredStudents.length || 0) / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        doc.text(`Student List for ${course?.title}`, 14, 15);
        doc.text(`Date: ${format(new Date(), 'PPP')}`, 14, 22);

        autoTable(doc, {
            startY: 30,
            head: [['S/N', 'Full Name', 'Candidate No.', 'Programme', 'Department', 'Score']],
            body: filteredStudents.map((student, index) => [
                index + 1,
                student.full_name,
                student.candidate_no,
                student.programme,
                student.department,
                student.score
            ]),
        });

        doc.save(`student-list-${course?.title}.pdf`);
    };

    const handleDownloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            filteredStudents.map((student, index) => ({
                'S/N': index + 1,
                'Full Name': student.full_name,
                'Candidate No.': student.candidate_no,
                'Programme': student.programme,
                'Department': student.department,
                'Score': student.score
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
        XLSX.writeFile(workbook, `student-list-${course?.title}.xlsx`);
    };

    // Handle loading states
    if (studentsLoading || scoresLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar>
                    <Link
                        to={`/exams/${userId}/${courseId}`}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <i className="fas fa-file-alt"></i>
                        <span>Exams</span>
                    </Link>
                    <Link
                        to={`/instructor/${userId}`}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <i className="fas fa-book"></i>
                        <span>Courses</span>
                    </Link>
                </Sidebar>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <i className="fas fa-spinner fa-spin text-blue-500 text-3xl mb-4"></i>
                        <p className="text-gray-600">Loading student information...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Handle error states
    if (studentsError || scoresError) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar>
                    <Link
                        to={`/exams/${userId}/${courseId}`}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <i className="fas fa-file-alt"></i>
                        <span>Exams</span>
                    </Link>
                    <Link
                        to={`/instructor/${userId}`}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <i className="fas fa-book"></i>
                        <span>Courses</span>
                    </Link>
                </Sidebar>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-md">
                        <i className="fas fa-exclamation-triangle text-yellow-500 text-3xl mb-4"></i>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h3>
                        <p className="text-gray-600 mb-6">Unable to load student information. Please try again later.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <Sidebar>
                <Link
                    to={`/exams/${userId}/${courseId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <i className="fas fa-file-alt"></i>
                    <span>Exams</span>
                </Link>
                <Link
                    to={`/instructor/${userId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <i className="fas fa-book"></i>
                    <span>Courses</span>
                </Link>
                <Link
                    to={`/question-bank/${userId}/${courseId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <i className="fas fa-question-circle"></i>
                    <span>Question Bank</span>
                </Link>
            </Sidebar>
            
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            {course?.title || "Course"} Students
                        </h1>
                        <p className="text-gray-600">
                            View and manage students in this course
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <button onClick={handleDownloadPdf} className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2">
                            <FaFilePdf /> PDF
                        </button>
                        <button onClick={handleDownloadExcel} className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2">
                            <FaFileExcel /> Excel
                        </button>
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S/N</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Full Name</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Candidate Number</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Programme</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentStudents && currentStudents.length > 0 ? (
                                    currentStudents.map((student, index) => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="py-4 px-6 text-sm text-gray-600">{indexOfFirstItem + index + 1}</td>
                                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                                {student.full_name || "N/A"}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {student.candidate_no || "N/A"}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {student.programme || "N/A"}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {student.department || "N/A"}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {student.score}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8">
                                            <i className="fas fa-users text-gray-300 text-3xl mb-3"></i>
                                            <p className="text-gray-500">No students found</p>
                                            <p className="text-gray-400 text-sm mt-1">There are no students enrolled in this course</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredStudents.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing {indexOfFirstItem + 1} to{" "}
                                    {Math.min(indexOfLastItem, filteredStudents.length)}{" "}
                                    of {filteredStudents.length} students
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                                            currentPage === 1
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                        }`}
                                    >
                                        Previous
                                    </button>

                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index + 1}
                                            onClick={() => paginate(index + 1)}
                                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                                                currentPage === index + 1
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                                            currentPage === totalPages
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default InstructorStudents;