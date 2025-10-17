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
    FaUser,
    FaTimes,
    FaSearchPlus
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
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [error, setError] = useState(null);

    const fetchStudents = async () => {
        setLoadingStudents(true);
        setError(null);
        try {
            if (userData?.exam?.course_id) {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                
                const res = await axios.get(`${path}/invigilator/students/${userData.exam.course_id}`, { headers });
                setStudents(res.data || []);
            } else {
                setError("No course ID found for the exam");
            }
        } catch (err) {
            console.log("Error fetching students:", err);
            setError(err.response?.data?.message || "Failed to load students. Please try again.");
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
            
            // Just mark student as checked in - don't generate ticket
            const response = await axios.post(`${path}/invigilator/checkin-student`, {
                student_id: student.id,
                course_id: userData.exam.course_id
            }, { headers });

            if (response.status === 200) {
                const updatedStudent = response.data;
                
                setStudents(prevStudents => 
                    prevStudents.map(s => 
                        s.id === student.id 
                            ? { ...s, is_checked_in: true, checkin_time: updatedStudent.checkin_time || new Date().toISOString() }
                            : s
                    )
                );

                setShowSuccess(true);
                
                setTimeout(() => {
                    setShowSuccess(false);
                }, 3000);
            }
        } catch (err) {
            console.error("Check-in error:", err);
            console.error("Error response:", err.response);
            console.error("Error data:", err.response?.data);
            
            const errorMessage = err.response?.data?.error 
                || err.response?.data?.message 
                || err.message 
                || "Failed to check in student. Please try again.";
            
            alert(`Check-in failed: ${errorMessage}`);
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
            (filterStatus === 'pending' && !student.is_checked_in) ||
            (filterStatus === 'checked-in' && student.is_checked_in);
        
        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        // Sort: Pending students first, then by name
        const aChecked = a.is_checked_in;
        const bChecked = b.is_checked_in;
        
        if (!aChecked && bChecked) return -1;
        if (aChecked && !bChecked) return 1;
        return a.full_name.localeCompare(b.full_name);
    });

    const stats = {
        total: students.length,
        pending: students.filter(s => !s.is_checked_in).length,
        checkedIn: students.filter(s => s.is_checked_in).length
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

    // Check for various "no exam" scenarios
    if (!userData || 
        userData === "no exam activated" || 
        !userData.exam || 
        !userData.exam.course_id ||
        userData.examAssigned === false) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="text-center bg-white p-12 rounded-xl shadow-lg max-w-lg">
                        <FaExclamationTriangle className="text-7xl text-yellow-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">No Exam Assigned</h2>
                        <p className="text-gray-600 text-lg mb-6">
                            You currently don't have an active exam assigned to you. 
                            Please contact the administrator to assign an exam.
                        </p>
                        
                        {/* Additional info box */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-left mb-6">
                            <p className="text-sm text-blue-800">
                                <strong>What to do:</strong><br/>
                                • Contact your administrator or exam coordinator<br/>
                                • Ensure your invigilator account is properly set up<br/>
                                • Verify that an exam has been activated and assigned to you
                            </p>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FaSync className="mr-2" />
                                Refresh Page
                            </button>
                            <Link
                                to="/admin-login"
                                className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <FaSignOutAlt className="mr-2" />
                                Logout
                            </Link>
                        </div>
                    </div>

                    {/* Debug info (only in development) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-lg">
                            <p className="font-bold mb-2">Debug Info:</p>
                            <pre className="overflow-auto">{JSON.stringify({
                                userData: userData ? 'exists' : 'null',
                                userDataValue: userData === "no exam activated" ? "no exam activated" : typeof userData,
                                hasExam: !!userData?.exam,
                                hasCourseId: !!userData?.exam?.course_id,
                                examAssigned: userData?.examAssigned
                            }, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Photo Modal */}
            {showPhotoModal && selectedPhoto && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowPhotoModal(false)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
                        {/* Close button */}
                        <button
                            onClick={() => setShowPhotoModal(false)}
                            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg z-10 transition-all"
                        >
                            <FaTimes className="text-2xl" />
                        </button>

                        {/* Student info header */}
                        <div className="bg-blue-600 text-white p-6">
                            <h2 className="text-3xl font-bold mb-2">{selectedPhoto.name}</h2>
                            <p className="text-xl">Student ID: <span className="font-mono font-bold">{selectedPhoto.id}</span></p>
                        </div>

                        {/* Full size photo */}
                        <div className="p-8 flex items-center justify-center bg-gray-50">
                            <img
                                src={`${path.replace('/api', '')}/${selectedPhoto.image}`}
                                alt={selectedPhoto.name}
                                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        {/* Instructions */}
                        <div className="bg-gray-100 p-4 text-center text-gray-600">
                            <p className="text-sm">Click anywhere outside the photo or press the X button to close</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Notification */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 animate-bounce">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3">
                        <FaCheckCircle className="text-2xl" />
                        <div>
                            <p className="font-bold">Student Checked In Successfully!</p>
                            <p className="text-sm">Student can now access the exam</p>
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
                                <p className="text-gray-600">
                                    Welcome, {userData?.Invigilator?.full_name}
                                </p>
                                {userData?.exam?.course && (
                                    <p className="text-sm text-blue-600 font-semibold mt-1">
                                        Managing: {userData.exam.course}
                                    </p>
                                )}
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
                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded-lg">
                        <div className="flex items-start">
                            <FaExclamationTriangle className="text-red-500 text-2xl mt-1 mr-4" />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Students</h3>
                                <p className="text-red-800 mb-3">{error}</p>
                                <button
                                    onClick={() => {
                                        setError(null);
                                        fetchStudents();
                                    }}
                                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <FaSync className="mr-2" />
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Important Notice */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-lg">
                    <div className="flex items-start">
                        <FaCheckCircle className="text-blue-500 text-2xl mt-1 mr-4" />
                        <div>
                            <h3 className="text-lg font-bold text-blue-900 mb-2">Your Role as Invigilator</h3>
                            <p className="text-blue-800">
                                <strong>Physically verify each student's identity</strong> before checking them in. 
                                Students with tickets can only access the exam <strong>after you check them in</strong>. 
                                Your check-in approval is required for exam access.
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
                            const isCheckedIn = student.is_checked_in;
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
                                    <div className="relative group cursor-pointer">
                                        {student.image ? (
                                            <>
                                                <img
                                                    src={`${path.replace('/api', '')}/${student.image}`}
                                                    alt={student.full_name}
                                                    className="w-full h-64 object-cover"
                                                    onClick={() => {
                                                        setSelectedPhoto({ image: student.image, name: student.full_name, id: student.candidate_no });
                                                        setShowPhotoModal(true);
                                                    }}
                                                />
                                                {/* Zoom overlay hint */}
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                                    <FaSearchPlus className="text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-64 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                                <FaGraduationCap className="text-white text-8xl opacity-50" />
                                            </div>
                                        )}
                                        
                                        {/* Status Badge */}
                                        <div className="absolute top-4 right-4 z-10">
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
                                            
                                            {/* Always show ticket number if student has one */}
                                            {student.ticket_no && student.ticket_no !== 'null' && (
                                                <div className="flex justify-between">
                                                    <span className="font-semibold">Ticket Number:</span>
                                                    <span className="font-mono text-blue-600 font-bold text-lg">{student.ticket_no}</span>
                                                </div>
                                            )}
                                            
                                            {isCheckedIn && (
                                                <>
                                                    <div className="pt-2 border-t-2 border-gray-200 mt-3"></div>
                                                    {student.checkin_time && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="font-semibold">Check-in Time:</span>
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
