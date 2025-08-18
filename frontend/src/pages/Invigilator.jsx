<<<<<<< Updated upstream
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
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
import axios from "axios";
import { path } from "../../utils/path";
import Sidebar from "../components/Sidebar";
=======
import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { 
  FaCheck, 
  FaExclamationTriangle, 
  FaSearch, 
  FaGraduationCap, 
  FaClock, 
  FaSync,
  FaFilter,
  FaSort,
  FaChalkboardTeacher,
  FaBook,
  FaUsers,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";
import axios from "axios";
import { path } from "../../utils/path";
import logo from "/assets/logo.webp";
>>>>>>> Stashed changes

const Invigilator = () => {
    const { id } = useParams();
    const { data: userData, loading: userLoading, error: userError } = useFetch(`/get-invigilator/${id}`);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const [currentExam, setCurrentExam] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
<<<<<<< Updated upstream
    const [students, setStudents] = useState();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const fetch = async () => {
=======
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortField, setSortField] = useState('full_name');
    const [sortDirection, setSortDirection] = useState('asc');

    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [checkingIn, setCheckingIn] = useState(null); // Track which student is being checked in
    const [stats, setStats] = useState({
        total: 0,
        checkedIn: 0,
        notCheckedIn: 0
    });

    const fetchStudents = async () => {
        setLoadingStudents(true);
>>>>>>> Stashed changes
        try {
            const res = await axios(`${path}/get-students`);
            const studentsData = res.data || [];
            setStudents(studentsData);
            
            // Update stats
            const total = studentsData.length;
            const checkedIn = studentsData.filter(student => student.is_logged_on === "yes").length;
            setStats({
                total,
                checkedIn,
                notCheckedIn: total - checkedIn
            });
            
            // Update last updated timestamp
            setLastUpdated(new Date());
        } catch (err) {
            console.log(err);
        } finally {
            setLoadingStudents(false);
        }
    };

    const fetchCurrentExam = async () => {
        try {
            const res = await axios(`${path}/get-current-exam`);
            setCurrentExam(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchCurrentExam();
        
        // Set up polling for real-time updates
        const interval = setInterval(() => {
            fetchStudents();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 10;

<<<<<<< Updated upstream
    // Filter students based on search term
    const filteredStudents = students?.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.candidate_no.toString().includes(searchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.programme.toLowerCase().includes(searchTerm.toLowerCase())
    );
=======
    // Filter and sort students
    const processedStudents = useMemo(() => {
        let result = students;
        
        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(student => 
                student.full_name.toLowerCase().includes(term) ||
                student.candidate_no.toString().includes(term) ||
                student.department.toLowerCase().includes(term) ||
                student.programme.toLowerCase().includes(term)
            );
        }
        
        // Apply status filter
        if (filterStatus !== 'all') {
            result = result.filter(student => {
                if (filterStatus === 'checked-in') {
                    return student.is_logged_on === "yes";
                } else if (filterStatus === 'not-checked-in') {
                    return student.is_logged_on !== "yes";
                }
                return true;
            });
        }
        
        // Apply sorting
        result = [...result].sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];
            
            if (aValue == null) aValue = '';
            if (bValue == null) bValue = '';
            
            if (sortField === 'checkin_time') {
                const aHasTime = !!aValue;
                const bHasTime = !!bValue;
                
                if (aHasTime && !bHasTime) return -1;
                if (!aHasTime && bHasTime) return 1;
                if (!aHasTime && !bHasTime) return 0;
            }
            
            aValue = aValue.toString();
            bValue = bValue.toString();
            
            if (sortDirection === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });
        
        return result;
    }, [students, searchTerm, filterStatus, sortField, sortDirection]);
>>>>>>> Stashed changes

    // Pagination calculations
    const totalPages = Math.ceil(processedStudents.length / studentsPerPage);
    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = processedStudents.slice(indexOfFirstStudent, indexOfLastStudent);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, sortField, sortDirection]);

    const handleCheck = async (studentId) => {
<<<<<<< Updated upstream
        try {
            const checkStdRes = await axios.post(`${path}/check-student/${studentId}`);
            console.log(checkStdRes);
            fetch();
=======
        setCheckingIn(studentId); // Set loading state
        try {
            const checkStdRes = await axios.post(`${path}/check-student/${studentId}`);
            console.log("Check-in response:", checkStdRes.data);
            
            // Check if the response indicates success
            const isLoggedIn = checkStdRes.data.is_logged_on === "yes";
            
            // Update the specific student in the state
            setStudents(prevStudents => 
                prevStudents.map(student => 
                    student.id === studentId 
                        ? { 
                            ...student, 
                            is_logged_on: isLoggedIn ? "yes" : "no",
                            checkin_time: checkStdRes.data.checkin_time || student.checkin_time
                        } 
                        : student
                )
            );
            
            // Update stats if check-in was successful
            if (isLoggedIn) {
                setStats(prevStats => ({
                    ...prevStats,
                    checkedIn: prevStats.checkedIn + 1,
                    notCheckedIn: prevStats.notCheckedIn - 1
                }));
            }
>>>>>>> Stashed changes
        } catch (err) {
            console.log("Check-in error:", err);
            // Show error to user
            alert("Failed to check in student. Please try again.");
        } finally {
            setCheckingIn(null); // Reset loading state
        }
    };

<<<<<<< Updated upstream
    const openConfirmDialog = (student) => {
        setSelectedStudent(student);
        setShowConfirmDialog(true);
    };

    const closeConfirmDialog = () => {
        setShowConfirmDialog(false);
        setSelectedStudent(null);
    };

    const confirmCheckIn = () => {
        if (selectedStudent) {
            handleCheck(selectedStudent.id);
            closeConfirmDialog();
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar>
                    <Link
                        to={`/invigilator/${id}`}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 hover:text-black rounded-lg transition-colors"
                    >
                        <FaChalkboardTeacher />
                        <span>Dashboard</span>
                    </Link>
                </Sidebar>
                <div className="flex-1 p-6">
                    <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-2xl font-bold">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar>
                    <Link
                        to={`/invigilator/${id}`}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 hover:text-black rounded-lg transition-colors"
                    >
                        <FaChalkboardTeacher />
                        <span>Dashboard</span>
                    </Link>
                </Sidebar>
                <div className="flex-1 p-6">
                    <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                        <FaExclamationTriangle className="text-6xl mb-4" />
                        <p className="text-2xl font-bold">An error occurred</p>
                        <p className="mt-2 text-gray-500">Please try again later</p>
                    </div>
                </div>
=======
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Loading state
    if (userLoading || loadingStudents) {
        return (
            <div className="flex min-h-screen bg-gray-50 text-gray-800">
                {/* Sidebar */}
                <aside className="w-64 bg-white p-6 flex-shrink-0 border-r border-gray-200">
                    <div className="flex items-center mb-10">
                        <img src={logo} alt="School Logo" className="h-10 w-10 mr-3" />
                        <h1 className="text-xl font-bold text-gray-900">Invigilator Panel</h1>
                    </div>
                    <nav className="space-y-2">
                        <Link to={`/invigilator/${id}`} className="flex items-center p-3 bg-blue-500 text-white rounded-lg">
                            <FaChalkboardTeacher className="mr-3" /> Dashboard
                        </Link>
                        <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaCalendarAlt className="mr-3" /> Schedule
                        </Link>
                        <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaBook className="mr-3" /> Exam Details
                        </Link>
                        <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaUsers className="mr-3" /> Students
                        </Link>
                    </nav>
                    <div className="absolute bottom-6 left-6 right-6 w-52">
                        <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaCog className="mr-3" /> Settings
                        </Link>
                        <Link to="/login" className="flex items-center p-3 mt-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <FaSignOutAlt className="mr-3" /> Logout
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="flex flex-col items-center justify-center min-h-[70vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-xl font-medium text-gray-700">Loading student data...</p>
                    </div>
                </main>
>>>>>>> Stashed changes
            </div>
        );
    }

    // Error state
    if (userError) {
        return (
<<<<<<< Updated upstream
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar>
                    <Link
                        to={`/invigilator/${id}`}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 hover:text-black rounded-lg transition-colors"
                    >
                        <FaChalkboardTeacher />
                        <span>Dashboard</span>
                    </Link>
                </Sidebar>
                <div className="flex-1 p-6">
                    <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                        <FaExclamationTriangle className="text-6xl mb-4" />
                        <p className="text-2xl font-bold">No Exam Assigned</p>
                        <p className="mt-2 text-gray-500">Please contact the administrator</p>
                    </div>
                </div>
=======
            <div className="flex min-h-screen bg-gray-50 text-gray-800">
                {/* Sidebar */}
                <aside className="w-64 bg-white p-6 flex-shrink-0 border-r border-gray-200">
                    <div className="flex items-center mb-10">
                        <img src={logo} alt="School Logo" className="h-10 w-10 mr-3" />
                        <h1 className="text-xl font-bold text-gray-900">Invigilator Panel</h1>
                    </div>
                    <nav className="space-y-2">
                        <Link to={`/invigilator/${id}`} className="flex items-center p-3 bg-blue-500 text-white rounded-lg">
                            <FaChalkboardTeacher className="mr-3" /> Dashboard
                        </Link>
                        <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaCalendarAlt className="mr-3" /> Schedule
                        </Link>
                        <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaBook className="mr-3" /> Exam Details
                        </Link>
                        <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaUsers className="mr-3" /> Students
                        </Link>
                    </nav>
                    <div className="absolute bottom-6 left-6 right-6 w-52">
                        <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaCog className="mr-3" /> Settings
                        </Link>
                        <Link to="/login" className="flex items-center p-3 mt-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <FaSignOutAlt className="mr-3" /> Logout
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="flex flex-col items-center justify-center min-h-[70vh] text-gray-500">
                        <FaExclamationTriangle className="text-5xl mb-4 text-yellow-500" />
                        <p className="text-xl font-medium mb-4">An error occurred</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </main>
>>>>>>> Stashed changes
            </div>
        );
    }

<<<<<<< Updated upstream
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar>
                <Link
                    to={`/invigilator/${id}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 hover:text-black rounded-lg transition-colors"
                >
                    <FaChalkboardTeacher />
                    <span>Dashboard</span>
                </Link>
            </Sidebar>

            <div className="flex-1 p-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Welcome back, {data?.Invigilator?.full_name}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Managing exam: <span className="font-semibold text-blue-600">{currentExam?.course || 'No Active Exam'}</span>
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FaUserGraduate className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Total Students</p>
                                    <p className="text-xl font-bold text-gray-800">{students?.length || 0}</p>
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    className="w-full lg:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaSearch className="absolute top-3 left-3 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Checked In</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {students?.filter(s => s.checkin_time).length || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <FaCheck className="text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Not Checked In</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {students?.filter(s => !s.checkin_time).length || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                <FaClock className="text-orange-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Currently Online</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {students?.filter(s => s.is_logged_on === "yes").length || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <FaUser className="text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Student Check-in</h2>
                            <p className="text-sm text-gray-500">
                                {filteredStudents?.length || 0} students found
                            </p>
                        </div>
                    </div>

                    {currentStudents.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Student
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Department
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Program
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Check-in Time
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentStudents.map((student, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                            <span className="text-sm font-bold text-blue-600">
                                                                {student.full_name.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                                                            <div className="text-sm text-gray-500">#{student.candidate_no}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.department}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.programme}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.is_logged_on === "yes"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                        }`}>
                                                        {student.is_logged_on === "yes" ? "Online" : "Offline"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.checkin_time || "Not checked in"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {student.checkin_time ? (
                                                        <div className="flex items-center text-green-600">
                                                            <FaCheck className="mr-1" />
                                                            <span>Checked In</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => openConfirmDialog(student)}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                        >
                                                            Check In
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents?.length || 0)} of {filteredStudents?.length || 0} students
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1 rounded-md text-sm ${currentPage === 1
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                }`}
                                        >
                                            Previous
                                        </button>

                                        <div className="flex gap-1">
                                            {[...Array(totalPages)].map((_, index) => (
                                                <button
                                                    key={index + 1}
                                                    onClick={() => paginate(index + 1)}
                                                    className={`w-8 h-8 rounded-md text-sm ${currentPage === index + 1
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                        }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                }`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <FaGraduationCap className="mx-auto h-12 w-12" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No students found</h3>
                            <p className="text-gray-500">Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all duration-300">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Confirm Check-in</h3>
                                <button
                                    onClick={closeConfirmDialog}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {selectedStudent && (
                                <div className="mb-6">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                            <span className="text-lg font-bold text-blue-600">
                                                {selectedStudent.full_name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">{selectedStudent.full_name}</h4>
                                            <p className="text-sm text-gray-500">#{selectedStudent.candidate_no}</p>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-2">
                                        Are you sure you want to check in this student for the exam?
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        This action cannot be undone.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={closeConfirmDialog}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmCheckIn}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    Confirm Check-in
                                </button>
                            </div>
                        </div>
                    </div>
<<<<<<< Updated upstream

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
=======
    // No exam assigned state
    if (!userData || userData === "no exam activated" || userData.examAssigned === false) {
        return (
            <div className="flex min-h-screen bg-gray-50 text-gray-800">
                {/* Sidebar */}
                <aside className="w-64 bg-white p-6 flex-shrink-0 border-r border-gray-200">
                    <div className="flex items-center mb-10">
                        <img src={logo} alt="School Logo" className="h-10 w-10 mr-3" />
                        <h1 className="text-xl font-bold text-gray-900">Invigilator Panel</h1>
                    </div>
                    <nav className="space-y-2">
                        <Link to={`/invigilator/${id}`} className="flex items-center p-3 bg-blue-500 text-white rounded-lg">
                            <FaChalkboardTeacher className="mr-3" /> Dashboard
                        </Link>
                        <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaCalendarAlt className="mr-3" /> Schedule
                        </Link>
                        <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaBook className="mr-3" /> Exam Details
                        </Link>
                        <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaUsers className="mr-3" /> Students
                        </Link>
                    </nav>
                    <div className="absolute bottom-6 left-6 right-6 w-52">
                        <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaCog className="mr-3" /> Settings
                        </Link>
                        <Link to="/login" className="flex items-center p-3 mt-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <FaSignOutAlt className="mr-3" /> Logout
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="flex flex-col items-center justify-center min-h-[70vh] text-gray-500">
                        <FaExclamationTriangle className="text-5xl mb-4 text-yellow-500" />
                        <p className="text-xl font-medium">No Exam Assigned To You</p>
                        <p className="mt-2 text-center max-w-md">Please contact the administrator to assign an exam to you.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-6 flex-shrink-0 border-r border-gray-200">
                <div className="flex items-center mb-10">
                    <img src={logo} alt="School Logo" className="h-10 w-10 mr-3" />
                    <h1 className="text-xl font-bold text-gray-900">Invigilator Panel</h1>
                </div>
                <nav className="space-y-2">
                    <Link to={`/invigilator/${id}`} className="flex items-center p-3 bg-blue-500 text-white rounded-lg">
                        <FaChalkboardTeacher className="mr-3" /> Dashboard
                    </Link>
                    <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaCalendarAlt className="mr-3" /> Schedule
                    </Link>
                    <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaBook className="mr-3" /> Exam Details
                    </Link>
                    <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaUsers className="mr-3" /> Students
                    </Link>
                </nav>
                <div className="absolute bottom-6 left-6 right-6 w-52">
                    <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaCog className="mr-3" /> Settings
                    </Link>
                    <Link to="/login" className="flex items-center p-3 mt-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <FaSignOutAlt className="mr-3" /> Logout
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Welcome back, {userData?.Invigilator?.full_name || 'Invigilator'}!
                        </h2>
                        <p className="text-gray-500">Managing students for: <span className="font-semibold">{currentExam?.course || 'No Active Exam'}</span></p>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="text-sm text-gray-500">
                            Last updated: {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <button 
                            onClick={fetchStudents}
                            disabled={loadingStudents}
                            className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingStudents ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <FaSync className="mr-2" /> Refresh
                                </>
                            )}
                        </button>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-4 bg-blue-100 rounded-full text-blue-500">
                            <FaUsers />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Students</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-4 bg-green-100 rounded-full text-green-500">
                            <FaCheck />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Checked In</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.checkedIn}</h3>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-4 bg-red-100 rounded-full text-red-500">
                            <FaExclamationTriangle />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Pending</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.notCheckedIn}</h3>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, ID, department..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>>>>>>> Stashed changes
                            >
                                <option value="all">All Students</option>
                                <option value="checked-in">Checked In</option>
                                <option value="not-checked-in">Not Checked In</option>
                            </select>
                            
                            <button 
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus('all');
                                    setSortField('full_name');
                                    setSortDirection('asc');
                                }}
                            >
                                <FaFilter className="mr-2" /> Reset
                            </button>
                        </div>
                    </div>
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
                </div >
            )}
        </div >
=======
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {currentStudents.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th 
                                                scope="col" 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('full_name')}
                                            >
                                                <div className="flex items-center">
                                                    Student
                                                    {sortField === 'full_name' && (
                                                        <FaSort className={`ml-1 text-xs ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                                                    )}
                                                </div>
                                            </th>
                                            <th 
                                                scope="col" 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('candidate_no')}
                                            >
                                                <div className="flex items-center">
                                                    ID
                                                    {sortField === 'candidate_no' && (
                                                        <FaSort className={`ml-1 text-xs ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                                                    )}
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Department
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Programme
                                            </th>
                                            <th 
                                                scope="col" 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('checkin_time')}
                                            >
                                                <div className="flex items-center">
                                                    Status
                                                    {sortField === 'checkin_time' && (
                                                        <FaSort className={`ml-1 text-xs ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                                                    )}
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <FaGraduationCap className="text-blue-500" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                                                            <div className="text-sm text-gray-500">{student.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{student.candidate_no}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{student.department}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{student.programme}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        student.is_logged_on === "yes"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}>
                                                        {student.is_logged_on === "yes" ? "Checked In" : "Not Checked In"}
                                                    </span>
                                                    {student.checkin_time && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            <FaClock className="inline mr-1" /> {new Date(student.checkin_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {student.is_logged_on !== "yes" ? (
                                                        <button
                                                            onClick={() => handleCheck(student.id)}
                                                            disabled={checkingIn === student.id}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {checkingIn === student.id ? (
                                                                <>
                                                                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    Checking In...
                                                                </>
                                                            ) : "Check In"}
                                                        </button>
                                                    ) : (
                                                        <span className="text-green-500 flex items-center justify-end">
                                                            <FaCheck className="mr-1" /> Completed
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, processedStudents.length)} of {processedStudents.length} students
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1 rounded-md text-sm ${
                                            currentPage === 1
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        Previous
                                    </button>

                                    <div className="flex gap-1">
                                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = index + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = index + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + index;
                                            } else {
                                                pageNum = currentPage - 2 + index;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => paginate(pageNum)}
                                                    className={`w-8 h-8 rounded-md text-sm ${
                                                        currentPage === pageNum
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1 rounded-md text-sm ${
                                            currentPage === totalPages
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <FaGraduationCap className="mx-auto h-12 w-12" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                {searchTerm || filterStatus !== 'all' 
                                    ? "No students match your search/filter criteria" 
                                    : "No students found"}
                            </h3>
                            <p className="text-gray-500">
                                {searchTerm || filterStatus !== 'all' 
                                    ? "Try adjusting your search or filter criteria" 
                                    : "There are currently no students registered for this exam"}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
>>>>>>> Stashed changes
    );
};

export default Invigilator;