import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import {
    FaCheck,
    FaExclamationTriangle,
    FaSearch,
    FaGraduationCap,
    FaClock,
    FaFilter,
    FaSort,
    FaChalkboardTeacher,
    FaBook,
    FaUsers,
    FaCalendarAlt,
    FaCog,
    FaSignOutAlt,
    FaBell,
    FaSync,
    FaInfoCircle
} from "react-icons/fa";
import axios from "axios";
import { path } from "../../utils/path";
import logo from "/assets/buk.png";

const Invigilator = () => {
    const { id } = useParams();
    const { data: userData, loading: userLoading, error: userError } = useFetch(`/get-invigilator/${id}`);

    const [currentExam, setCurrentExam] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortField, setSortField] = useState('full_name');
    const [sortDirection, setSortDirection] = useState('asc');

    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [checkingIn, setCheckingIn] = useState(null); // Track which student is being checked in
    const [showSuccess, setShowSuccess] = useState(false);
    const [generatedTicket, setGeneratedTicket] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        checkedIn: 0,
        notCheckedIn: 0
    });

    const fetchStudents = async () => {
        console.log('fetchStudents called', { loadingStudents, userData });
        setLoadingStudents(true);
        try {
            // Get the active course from the exam data
            if (userData?.exam?.course_id) {
                console.log('Fetching students for course:', userData.exam.course_id);
                const res = await axios(`${path}/invigilator/students/${userData.exam.course_id}`);
                const studentsData = res.data || [];
                console.log('Received student data:', studentsData);

                setStudents(studentsData);

                // Calculate stats
                const total = studentsData.length;
                const checkedIn = studentsData.filter(s => s.ticket_no).length;
                const notCheckedIn = total - checkedIn;

                setStats({
                    total,
                    checkedIn,
                    notCheckedIn
                });
            } else {
                console.log('No course ID available in userData:', userData);
            }
        } catch (err) {
            console.log("Error fetching students:", err);
        } finally {
            console.log('Setting loadingStudents to false');
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
        // Only fetch if we have userData and it's not still loading
        console.log('useEffect triggered', { userData, userLoading });
        if (userData && !userLoading) {
            console.log('Fetching students and exam data');
            fetchStudents();
            fetchCurrentExam();

            // Set up polling for real-time updates (every 15 seconds for better responsiveness)
            const interval = setInterval(() => {
                console.log('Polling for student updates');
                fetchStudents();
            }, 15000);

            return () => clearInterval(interval);
        }
    }, [userData, userLoading]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 10;

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
                if (filterStatus === 'not-checked-in') {
                    return !student.checkin_time;
                } else if (filterStatus === 'checked-in') {
                    return student.checkin_time && student.is_logged_on !== "yes";
                } else if (filterStatus === 'exam-started') {
                    return student.is_logged_on === "yes";
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

    // Pagination calculations
    const totalPages = Math.ceil(processedStudents.length / studentsPerPage);
    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = processedStudents.slice(indexOfFirstStudent, indexOfLastStudent);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, sortField, sortDirection, students]);

    const handleCheck = async (studentId) => {
        setCheckingIn(studentId); // Set loading state
        try {
            console.log('Generating ticket for student:', studentId);
            // Make the API call to generate ticket
            const response = await axios.post(`${path}/invigilator/generate-ticket`, {
                student_id: studentId
            });

            console.log('Ticket generation response:', response);

            if (response.status === 200) {
                const candidate = response.data;
                console.log('Candidate data received:', candidate);

                // Update the student list with the ticket number
                setStudents(prevStudents => {
                    const updatedStudents = prevStudents.map(student =>
                        student.id === studentId
                            ? {
                                ...student,
                                ticket_no: candidate.ticket_no,
                                checkin_time: candidate.checkin_time,
                                is_logged_on: candidate.is_logged_on ? "yes" : "no"
                            }
                            : student
                    );
                    console.log('Updated students list:', updatedStudents);
                    return updatedStudents;
                });

                // Update stats immediately
                setStats(prevStats => ({
                    ...prevStats,
                    checkedIn: prevStats.checkedIn + 1,
                    notCheckedIn: prevStats.notCheckedIn - 1
                }));

                // Show success message with ticket number
                setGeneratedTicket(candidate.ticket_no);
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    setGeneratedTicket(null);
                }, 5000); // Hide after 5 seconds

                // Add a small delay then refresh to get actual data
                setTimeout(() => {
                    fetchStudents();
                }, 1000);
            }
        } catch (err) {
            console.log("Check-in error:", err);
            // Revert the optimistic update on error
            fetchStudents(); // Refetch to ensure data consistency
            alert("Failed to check in student. Please try again.");
        } finally {
            setCheckingIn(null); // Reset loading state
        }
    };

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
            </div>
        );
    }

    // Error state
    if (userError) {
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
                        <p className="text-xl font-medium mb-4">An error occurred</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </main>
            </div>
        );
    }

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

    // Stats cards matching admin dashboard
    const statCards = [
        { title: "Total Students", value: stats.total, icon: <FaUsers />, color: "blue" },
        { title: "Ready for Exam", value: stats.checkedIn, icon: <FaCheck />, color: "yellow" },
        { title: "Pending Check-in", value: stats.notCheckedIn, icon: <FaExclamationTriangle />, color: "red" }
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            {/* Sidebar - Matching Admin Dashboard exactly */}
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
                {/* Success Message */}
                {showSuccess && (
                    <div className="fixed top-4 right-4 z-50">
                        <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
                            <FaCheck className="mr-2" />
                            <span>Ticket {generatedTicket} generated successfully!</span>
                        </div>
                    </div>
                )}

                {/* Header - Matching Admin Dashboard */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Welcome back, {userData?.Invigilator?.full_name || 'Invigilator'}!
                        </h2>
                        <p className="text-gray-500">Managing students for: <span className="font-semibold">{currentExam?.course || 'No Active Exam'}</span></p>
                    </div>
                    <div className="flex items-center space-x-4">
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
                                    <FaSync className="mr-2" /> Refresh Data
                                </>
                            )}
                        </button>
                        <button className="p-3 bg-white border rounded-full hover:bg-gray-100">
                            <FaBell className="text-gray-600" />
                        </button>
                    </div>
                </header>

                {/* Important Notice for Invigilators */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <FaInfoCircle className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Invigilator Role</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    You must check in each student before they can access their exam.
                                    Only checked-in students will be able to proceed to the exam instructions page.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - Matching Admin Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                            <div className={`p-4 rounded-full ${stat.color === 'blue' ? 'bg-blue-100 text-blue-500' :
                                stat.color === 'green' ? 'bg-green-100 text-green-500' :
                                    'bg-red-100 text-red-500'
                                }`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
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
                            >
                                <option value="all">All Students</option>
                                <option value="not-checked-in">Not Checked In</option>
                                <option value="checked-in">Checked In (Ready for Exam)</option>
                                <option value="exam-started">Exam Started</option>
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
                                <FaFilter className="mr-2" /> Reset Filters
                            </button>
                        </div>
                    </div>
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
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ticket Number
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Check-in Status
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('checkin_time')}
                                            >
                                                <div className="flex items-center">
                                                    Check-in Time
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
                                        {console.log('Rendering students:', currentStudents)}
                                        {currentStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                {console.log('Student data:', student)}
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
                                                {/* Student ID */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{student.candidate_no}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{student.department}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{student.programme}</div>
                                                </td>
                                                {/* Ticket Number */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {student.ticket_no ? (
                                                        <div className="text-sm font-medium text-blue-600">
                                                            {student.ticket_no}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500">
                                                            Not generated
                                                        </div>
                                                    )}
                                                </td>
                                                {/* Status */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {student.ticket_no ? (
                                                        <div>
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                <FaCheck className="mr-1" /> Checked In
                                                            </span>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Ready for exam
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                                <FaExclamationTriangle className="mr-1" /> Not Checked In
                                                            </span>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Awaiting ticket
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {student.checkin_time ? (
                                                        <div className="text-sm text-gray-900">
                                                            {new Date(student.checkin_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500 italic">
                                                            Not checked in
                                                        </div>
                                                    )}
                                                </td>
                                                {/* Actions */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {!student.ticket_no ? (
                                                        <button
                                                            onClick={() => {
                                                                console.log('Generate ticket button clicked for student:', student.id);
                                                                handleCheck(student.id);
                                                            }}
                                                            disabled={checkingIn === student.id}
                                                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                                        >
                                                            {checkingIn === student.id ? (
                                                                <span className="flex items-center">
                                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    Generating...
                                                                </span>
                                                            ) : (
                                                                "Generate Ticket"
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center justify-end">
                                                            <span className="text-green-600 font-medium">Ticket Generated</span>
                                                            <FaCheck className="ml-1 text-green-600" />
                                                        </div>
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
                                        className={`px-3 py-1 rounded-md text-sm ${currentPage === 1
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
                                                    className={`w-8 h-8 rounded-md text-sm ${currentPage === pageNum
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
                                        className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages
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
                                    ? `No students match your search/filter criteria`
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
    );
};

export default Invigilator;
