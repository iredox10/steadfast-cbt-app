import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaCalendarAlt, FaPlus, FaTimes, FaUsers, FaBook, FaChalkboardTeacher, FaCog, FaSignOutAlt, FaListAlt } from "react-icons/fa";
import { path } from "../../../utils/path";

const AcdSession = () => {
    const { userId } = useParams();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showActivateModal, setShowActivateModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [newSessionTitle, setNewSessionTitle] = useState("");
    const [errMsg, setErrMsg] = useState("");

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${path}/get-acd-sessions`);
            setSessions(res.data);
        } catch (err) {
            console.error("Error fetching sessions:", err);
            setErrMsg("Failed to load sessions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleAddSession = async (e) => {
        e.preventDefault();
        if (!newSessionTitle) {
            setErrMsg("Session title cannot be empty.");
            return;
        }
        setErrMsg("");
        try {
            await axios.post(`${path}/add-acd-session`, { title: newSessionTitle, status: "inactive" });
            setShowAddModal(false);
            setNewSessionTitle("");
            fetchSessions(); // Refetch to show the new session
        } catch (err) {
            console.error("Error adding session:", err);
            setErrMsg(err.response?.data || "Failed to add session.");
        }
    };

    const handleActivateSession = async () => {
        if (!selectedSession) return;
        try {
            await axios.post(`${path}/activate-acd-session/${selectedSession.id}`);
            setShowActivateModal(false);
            setSelectedSession(null);
            fetchSessions(); // Refetch to show the updated statuses
        } catch (err) {
            console.error("Error activating session:", err);
            setErrMsg("Failed to activate session.");
        }
    };

    const openActivateModal = (session) => {
        setSelectedSession(session);
        setShowActivateModal(true);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-6 flex-shrink-0 border-r border-gray-200">
                <div className="flex items-center mb-10">
                    <img src="/assets/buk.png" alt="School Logo" className="h-10 w-10 mr-3" />
                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                </div>
                <nav className="space-y-2">
                    <Link to={`/admin-dashboard/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaListAlt className="mr-3" /> Dashboard
                    </Link>
                    <Link to="/admin-sessions" className="flex items-center p-3 bg-blue-500 text-white rounded-lg">
                        <FaCalendarAlt className="mr-3" /> Sessions
                    </Link>
                    <Link to={`/admin-students/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaUsers className="mr-3" /> Students
                    </Link>
                    <Link to="/admin-instructors" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaChalkboardTeacher className="mr-3" /> Instructors
                    </Link>
                    <Link to="/exam-archives" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaBook className="mr-3" /> Exam Archives
                    </Link>
                    <Link to={`/admin-exam/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaBook className="mr-3" /> Exams
                    </Link>
                </nav>
                <div className="absolute bottom-6 left-6 right-6 w-52">
                    <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaCog className="mr-3" /> Settings
                    </Link>
                    <Link to="/admin-login" className="flex items-center p-3 mt-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <FaSignOutAlt className="mr-3" /> Logout
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Academic Sessions</h2>
                        <p className="text-gray-500">Manage academic sessions and their semesters.</p>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                        <FaPlus className="mr-2" /> Add New Session
                    </button>
                </header>

                {loading ? (
                    <p>Loading sessions...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sessions.map((session) => (
                            <div key={session.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-800">{session.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${session.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                        }`}>
                                        {session.status}
                                    </span>
                                </div>
                                <p className="text-gray-500 mb-4">Contains {session.semesters?.length || 0} semesters.</p>
                                <div className="flex gap-3">
                                    <Link to={`/session/${session.id}`} className="flex-1 text-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                                        View Semesters
                                    </Link>
                                    {session.status === "inactive" && (
                                        <button onClick={() => openActivateModal(session)} className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                            Activate
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Add Session Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Add New Session</h3>
                            <button onClick={() => setShowAddModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAddSession}>
                            {errMsg && <p className="text-red-500 mb-4">{errMsg}</p>}
                            <label htmlFor="sessionTitle" className="block text-sm font-medium text-gray-700 mb-2">Session Title</label>
                            <input
                                id="sessionTitle"
                                type="text"
                                value={newSessionTitle}
                                onChange={(e) => setNewSessionTitle(e.target.value)}
                                placeholder="e.g., 2024/2025"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                    Create Session
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Activate Session Confirmation Modal */}
            {showActivateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold mb-4">Confirm Activation</h3>
                        <p>Are you sure you want to activate the <span className="font-bold">{selectedSession?.title}</span> session? This will deactivate any other active session.</p>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setShowActivateModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                                Cancel
                            </button>
                            <button onClick={handleActivateSession} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                Yes, Activate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcdSession;
