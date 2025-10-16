import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import {
    FaCheck,
    FaExclamationTriangle,
    FaSearch,
    FaGraduationCap,
    FaSync,
    FaSignOutAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaUser
} from "react-icons/fa";
import axios from "axios";
import { path } from "../../utils/path";
import logo from "../../public/assets/buk.png";

const Invigilator = () => {
    const { id } = useParams();
    const { data: userData, loading: userLoading } = useFetch(`/get-invigilator/${id}`);

    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [checkingIn, setCheckingIn] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [generatedTicket, setGeneratedTicket] = useState(null);

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            if (userData?.exam?.course_id) {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                
                const res = await axios.get(`${path}/invigilator/students/${userData.exam.course_id}`, { headers });
                setStudents(res.data || []);
            }
        } catch (err) {
            console.log("Error fetching students:", err);
        } finally {
            setLoadingStudents(false);
        }
    };

    useEffect(() => {
        if (userData && !userLoading) {
            fetchStudents();
        }
    }, [userData, userLoading]);

    const handleCheckIn = async (student) => {
        setCheckingIn(student.id);
        
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            
            const response = await axios.post(`${path}/invigilator/generate-ticket`, {
                student_id: student.id
            }, { headers });

            if (response.status === 200) {
                const candidate = response.data;
                
                setStudents(prevStudents => 
                    prevStudents.map(s => 
                        s.id === student.id 
                            ? { ...s, ticket_no: candidate.ticket_no, checkin_time: candidate.checkin_time }
                            : s
                    )
                );

                setGeneratedTicket(candidate.ticket_no);
                setShowSuccess(true);
                
                setTimeout(() => {
                    setShowSuccess(false);
                    setGeneratedTicket(null);
                }, 3000);
            }
        } catch (err) {
            console.log("Check-in error:", err);
            alert("Failed to check in student. Please try again.");
        } finally {
            setCheckingIn(null);
        }
    };

    // Filter students
    const filteredStudents = students.filter(student => {
        const matchesSearch = searchTerm === '' || 
            student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.candidate_no.toString().includes(searchTerm);
        
        const matchesFilter = 
            filterStatus === 'all' ||
            (filterStatus === 'pending' && (!student.ticket_no || student.ticket_no === 'null')) ||
            (filterStatus === 'checked-in' && student.ticket_no && student.ticket_no !== 'null');
        
        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        // Sort: Pending students first, then by name
        const aChecked = a.ticket_no && a.ticket_no !== 'null';
        const bChecked = b.ticket_no && b.ticket_no !== 'null';
        
        if (!aChecked && bChecked) return -1;
        if (aChecked && !bChecked) return 1;
        return a.full_name.localeCompare(b.full_name);
    });

    const stats = {
        total: students.length,
        pending: students.filter(s => !s.ticket_no || s.ticket_no === 'null').length,
        checkedIn: students.filter(s => s.ticket_no && s.ticket_no !== 'null').length
    };

    if (userLoading || loadingStudents) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700">Loading...</p>
                </div>
            </div>
        );
    }

    if (!userData || userData === "no exam activated") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
                    <FaExclamationTriangle className="text-6xl text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Exam</h2>
                    <p className="text-gray-600">Please contact the administrator to assign an exam to you.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Success Notification */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 animate-bounce">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3">
                        <FaCheckCircle className="text-2xl" />
                        <div>
                            <p className="font-bold">Student Checked In!</p>
                            <p className="text-sm">Ticket: {generatedTicket}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img src={logo} alt="Logo" className="h-12 w-12" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Invigilator Panel</h1>
                                <p className="text-gray-600">Welcome, {userData?.Invigilator?.full_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={fetchStudents}
                                disabled={loadingStudents}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                <FaSync className={`mr-2 ${loadingStudents ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <Link
                                to="/admin-login"
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                <FaSignOutAlt className="mr-2" />
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Important Notice */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-lg">
                    <div className="flex items-start">
                        <FaCheckCircle className="text-blue-500 text-2xl mt-1 mr-4" />
                        <div>
                            <h3 className="text-lg font-bold text-blue-900 mb-2">Your Role as Invigilator</h3>
                            <p className="text-blue-800">
                                <strong>Verify each student's identity</strong> before checking them in. 
                                Once checked in, students will receive a ticket number to access the exam. 
                                Only checked-in students can start their exam.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">Total Students</p>
                                <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <FaUser className="text-5xl text-blue-500 opacity-20" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">Pending Check-in</p>
                                <p className="text-4xl font-bold text-gray-900">{stats.pending}</p>
                            </div>
                            <FaTimesCircle className="text-5xl text-yellow-500 opacity-20" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">Checked In</p>
                                <p className="text-4xl font-bold text-gray-900">{stats.checkedIn}</p>
                            </div>
                            <FaCheckCircle className="text-5xl text-green-500 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                            />
                        </div>
                        
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                        >
                            <option value="all">All Students ({stats.total})</option>
                            <option value="pending">Pending Check-in ({stats.pending})</option>
                            <option value="checked-in">Checked In ({stats.checkedIn})</option>
                        </select>
                    </div>
                </div>

                {/* Students Grid */}
                {filteredStudents.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-md text-center">
                        <FaGraduationCap className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Students Found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterStatus !== 'all' 
                                ? 'Try adjusting your search or filter' 
                                : 'No students enrolled in this exam'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((student) => {
                            const isCheckedIn = student.ticket_no && student.ticket_no !== 'null';
                            const isProcessing = checkingIn === student.id;

                            return (
                                <div
                                    key={student.id}
                                    className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
                                        isCheckedIn 
                                            ? 'border-4 border-green-400' 
                                            : 'border-4 border-gray-200 hover:border-blue-400'
                                    }`}
                                >
                                    {/* Student Photo - Large and Prominent */}
                                    <div className="relative">
                                        {student.image ? (
                                            <img
                                                src={`${path.replace('/api', '')}/${student.image}`}
                                                alt={student.full_name}
                                                className="w-full h-64 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-64 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                                <FaGraduationCap className="text-white text-8xl opacity-50" />
                                            </div>
                                        )}
                                        
                                        {/* Status Badge */}
                                        <div className="absolute top-4 right-4">
                                            {isCheckedIn ? (
                                                <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold flex items-center shadow-lg">
                                                    <FaCheckCircle className="mr-2" />
                                                    CHECKED IN
                                                </div>
                                            ) : (
                                                <div className="bg-yellow-500 text-white px-4 py-2 rounded-full font-bold flex items-center shadow-lg">
                                                    <FaTimesCircle className="mr-2" />
                                                    PENDING
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Student Information */}
                                    <div className="p-6">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{student.full_name}</h3>
                                        
                                        <div className="space-y-2 mb-4 text-gray-700">
                                            <div className="flex justify-between">
                                                <span className="font-semibold">Student ID:</span>
                                                <span className="font-mono">{student.candidate_no}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-semibold">Department:</span>
                                                <span className="text-right">{student.department}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-semibold">Programme:</span>
                                                <span className="text-right">{student.programme}</span>
                                            </div>
                                            
                                            {isCheckedIn && (
                                                <>
                                                    <div className="pt-2 border-t-2 border-gray-200 mt-3"></div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Ticket Number:</span>
                                                        <span className="font-mono text-blue-600 font-bold text-lg">{student.ticket_no}</span>
                                                    </div>
                                                    {student.checkin_time && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="font-semibold">Time:</span>
                                                            <span>{new Date(student.checkin_time).toLocaleTimeString()}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        {!isCheckedIn && (
                                            <button
                                                onClick={() => handleCheckIn(student)}
                                                disabled={isProcessing}
                                                className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
                                                    isProcessing
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                                                } text-white shadow-lg`}
                                            >
                                                {isProcessing ? (
                                                    <span className="flex items-center justify-center">
                                                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Checking In...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center">
                                                        <FaCheckCircle className="mr-2" />
                                                        Check In Student
                                                    </span>
                                                )}
                                            </button>
                                        )}
                                        
                                        {isCheckedIn && (
                                            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                                                <p className="text-green-800 font-bold flex items-center justify-center">
                                                    <FaCheckCircle className="mr-2" />
                                                    Ready for Exam
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Invigilator;
