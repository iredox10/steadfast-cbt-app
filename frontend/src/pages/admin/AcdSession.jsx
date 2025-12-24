import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaCalendarAlt, FaPlus, FaTimes, FaBook, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { path } from "../../../utils/path";
import AdminSidebar from "../../components/AdminSidebar";

const AcdSession = () => {
    const { userId } = useParams();
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showActivateModal, setShowActivateModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [actionType, setActionType] = useState(''); // 'activate' or 'deactivate'
    const [newSessionTitle, setNewSessionTitle] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [errMsg, setErrMsg] = useState("");

    // Helper function to check if a session is active
    const isSessionActive = (session) => {
        return session.status === 'active';
    };

    const fetchSessions = async () => {
        setLoading(true);
        try {
            // Fetch current user to determine role
            const userRes = await axios.get(`${path}/user`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCurrentUser(userRes.data);

            // If level admin or faculty officer, only fetch the global active session
            if (['level_admin', 'faculty_officer'].includes(userRes.data.role)) {
                try {
                    const activeSessionRes = await axios.get(`${path}/get-global-session`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    setActiveSession(activeSessionRes.data);
                    setErrMsg(""); // Clear any previous errors
                } catch (err) {
                    if (err.response?.status === 404) {
                        // This is expected when no global session is set - not an error
                        setActiveSession(null);
                        setErrMsg(""); // Don't show error, we'll show an info message instead
                    } else {
                        setErrMsg("Failed to load active session.");
                    }
                }
            } else {
                // Super admin can see all sessions
                const res = await axios.get(`${path}/get-acd-sessions`);
                setSessions(res.data);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            setErrMsg("Failed to load session data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleAddSession = async (e) => {
        e.preventDefault();
        if (!selectedYear) {
            setErrMsg("Please select a year.");
            return;
        }
        setErrMsg("");
        
        const year = parseInt(selectedYear);
        const sessionTitle = `${year}/${year + 1}`;
        
        try {
            await axios.post(`${path}/add-acd-session`, { title: sessionTitle, status: "inactive" });
            setShowAddModal(false);
            setSelectedYear("");
            setNewSessionTitle("");
            fetchSessions(); // Refetch to show the new session
        } catch (err) {
            console.error("Error adding session:", err);
            setErrMsg(err.response?.data || "Failed to add session.");
        }
    };
    
    const handleYearChange = (e) => {
        const year = e.target.value;
        setSelectedYear(year);
        if (year) {
            const nextYear = parseInt(year) + 1;
            setNewSessionTitle(`${year}/${nextYear}`);
        } else {
            setNewSessionTitle("");
        }
    };
    
    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        // Generate years from 10 years ago up to 2060
        for (let i = currentYear - 10; i <= 2060; i++) {
            years.push(i);
        }
        return years;
    };

    const handleActivateSession = async () => {
        if (!selectedSession) return;
        try {
            if (actionType === 'activate') {
                await axios.post(`${path}/activate-acd-session/${selectedSession.id}`);
            } else if (actionType === 'deactivate') {
                await axios.post(`${path}/deactivate-acd-session/${selectedSession.id}`);
            }
            setShowActivateModal(false);
            setShowDeactivateModal(false);
            setSelectedSession(null);
            setActionType('');
            fetchSessions(); // Refetch to show the updated statuses
        } catch (err) {
            console.error(`Error ${actionType}ing session:`, err);
            setErrMsg(`Failed to ${actionType} session.`);
        }
    };

    const openActivateModal = (session) => {
        setSelectedSession(session);
        setActionType('activate');
        setShowActivateModal(true);
    };

    const openDeactivateModal = (session) => {
        setSelectedSession(session);
        setActionType('deactivate');
        setShowDeactivateModal(true);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <AdminSidebar userId={userId} />

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Academic Sessions</h2>
                        <p className="text-gray-500">
                            {currentUser?.role === 'level_admin' 
                                ? "View the currently active academic session set by the super administrator."
                                : "Manage academic sessions and their semesters."
                            }
                        </p>
                    </div>
                    {currentUser?.role === 'super_admin' && (
                        <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                            <FaPlus className="mr-2" /> Add New Session
                        </button>
                    )}
                </header>

                {errMsg && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2">
                            <FaExclamationTriangle className="text-red-600" />
                            <span className="text-red-800">{errMsg}</span>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Level Admin and Faculty Officer View - Only Active Session */}
                        {['level_admin', 'faculty_officer'].includes(currentUser?.role) && (
                            <div className="max-w-2xl">
                                {activeSession ? (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <FaCalendarAlt className="text-green-600 text-xl" />
                                            <h3 className="text-xl font-semibold text-green-800">Active Academic Session</h3>
                                        </div>
                                        <div className="bg-white rounded-lg p-6 border border-green-200">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-2xl font-bold text-gray-900">{activeSession.title}</h4>
                                                    {activeSession.description && (
                                                        <p className="text-gray-600 mt-2">{activeSession.description}</p>
                                                    )}
                                                </div>
                                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            </div>
                                            <div className="pt-4 border-t border-gray-200">
                                                <Link 
                                                    to={`/session/${activeSession.id}`} 
                                                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                >
                                                    <FaBook className="mr-2" />
                                                    View Semesters & Courses
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <FaInfoCircle className="text-blue-600" />
                                                <span className="text-blue-800 text-sm">
                                                    This is the system-wide active session set by the super administrator. Only courses added to this session will be available for use.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                                        <FaExclamationTriangle className="text-yellow-600 text-4xl mb-4 mx-auto" />
                                        <h3 className="text-xl font-semibold text-yellow-800 mb-2">No Active Session</h3>
                                        <p className="text-yellow-700 mb-4">
                                            No global academic session is currently active. Please contact the super administrator to set an active session.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Super Admin View - All Sessions */}
                        {currentUser?.role === 'super_admin' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sessions.map((session) => (
                                    <div key={session.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-800">{session.title}</h3>
                                                {session.description && (
                                                    <p className="text-gray-600 text-sm mt-1">{session.description}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    isSessionActive(session)
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                                    }`}>
                                                    {isSessionActive(session) ? "Active" : "Inactive"}
                                                </span>
                                                {isSessionActive(session) && (
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                        Global Session
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-gray-500 mb-4">Contains {session.semesters?.length || 0} semesters.</p>
                                        <div className="flex gap-3">
                                            <Link to={`/session/${session.id}`} className="flex-1 text-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                                                View Semesters
                                            </Link>
                                            {!isSessionActive(session) ? (
                                                <button onClick={() => openActivateModal(session)} className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                                                    Activate
                                                </button>
                                            ) : (
                                                <button onClick={() => openDeactivateModal(session)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                                    Deactivate
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Add Session Modal - Super Admin Only */}
            {showAddModal && currentUser?.role === 'super_admin' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Add New Session</h3>
                            <button onClick={() => setShowAddModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAddSession}>
                            {errMsg && <p className="text-red-500 mb-4">{errMsg}</p>}
                            <div className="mb-4">
                                <label htmlFor="sessionYear" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Academic Year
                                </label>
                                <select
                                    id="sessionYear"
                                    value={selectedYear}
                                    onChange={handleYearChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">-- Select Year --</option>
                                    {generateYearOptions().map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    Select the starting year of the academic session
                                </p>
                            </div>
                            
                            {newSessionTitle && (
                                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Session will be created as:</p>
                                    <p className="text-lg font-bold text-blue-800">{newSessionTitle}</p>
                                </div>
                            )}
                            
                            <div className="flex justify-end gap-4 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setSelectedYear("");
                                        setNewSessionTitle("");
                                        setErrMsg("");
                                    }} 
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                                    disabled={!selectedYear}
                                >
                                    Create Session
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Activate/Deactivate Session Confirmation Modal - Super Admin Only */}
            {(showActivateModal || showDeactivateModal) && currentUser?.role === 'super_admin' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold mb-4">
                            Confirm {actionType === 'activate' ? 'Activation' : 'Deactivation'}
                        </h3>
                        <p>
                            Are you sure you want to {actionType} the <span className="font-bold">{selectedSession?.title}</span> session?
                            {actionType === 'activate' && ' This will deactivate any other active session.'}
                            {actionType === 'deactivate' && ' This will make it unavailable for use.'}
                        </p>
                        <div className="flex justify-end gap-4 mt-6">
                            <button 
                                onClick={() => {
                                    setShowActivateModal(false);
                                    setShowDeactivateModal(false);
                                    setActionType('');
                                    setSelectedSession(null);
                                }} 
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleActivateSession} 
                                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                                    actionType === 'activate' 
                                        ? 'bg-green-500 hover:bg-green-600' 
                                        : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                Yes, {actionType === 'activate' ? 'Activate' : 'Deactivate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcdSession;
