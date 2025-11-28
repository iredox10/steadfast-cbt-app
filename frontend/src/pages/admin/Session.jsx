import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaCalendarAlt, FaPlus, FaTimes, FaChevronRight } from "react-icons/fa";
import { path } from "../../../utils/path";
import AdminSidebar from "../../components/AdminSidebar";

const Session = () => {
    const { id: sessionId, userId } = useParams();
    const [session, setSession] = useState(null);
    const [semesters, setSemesters] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showActivateModal, setShowActivateModal] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [newSemesterTitle, setNewSemesterTitle] = useState("");
    const [isCustomSemester, setIsCustomSemester] = useState(false);
    const [errMsg, setErrMsg] = useState("");

    const fetchSessionAndSemesters = async () => {
        setLoading(true);
        try {
            // Fetch current user first
            const userRes = await axios.get(`${path}/user`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCurrentUser(userRes.data);

            // Fetch session data
            const sessionRes = await axios.get(`${path}/get-acd-session/${sessionId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSession(sessionRes.data);

            // Debug: Log the session ID being used
            console.log('Fetching semesters for session ID:', sessionId);

            // Fetch semesters (filtered by user role on backend)
            const semestersRes = await axios.get(`${path}/get-semesters/${sessionId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Debug: Log the response
            console.log('Semesters API Response:', semestersRes.data);
            console.log('Response type:', typeof semestersRes.data);
            console.log('Is array:', Array.isArray(semestersRes.data));

            // Ensure semesters is always an array
            const semestersData = Array.isArray(semestersRes.data) ? semestersRes.data : [];
            setSemesters(semestersData);

            console.log('Processed semesters:', semestersData);
        } catch (err) {
            console.error("Error fetching data:", err);
            setErrMsg("Failed to load session data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessionAndSemesters();
    }, [sessionId]);

    const handleAddSemester = async (e) => {
        e.preventDefault();
        if (!newSemesterTitle) {
            setErrMsg("Semester title cannot be empty.");
            return;
        }
        setErrMsg("");
        try {
            const res = await axios.post(`${path}/add-semester/${sessionId}`,
                { semester: newSemesterTitle, status: "inactive" },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setShowAddModal(false);
            setNewSemesterTitle("");
            fetchSessionAndSemesters();
            console.log('the response', res)
        } catch (err) {
            console.error("Error adding semester:", err);
            const errorMessage = err.response?.data?.error || err.response?.data || "Failed to add semester.";
            setErrMsg(errorMessage);
        }
    };

    const handleActivateSemester = async () => {
        if (!selectedSemester) return;
        try {
            await axios.post(`${path}/activate-semester/${selectedSemester.id}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setShowActivateModal(false);
            setSelectedSemester(null);
            fetchSessionAndSemesters();
        } catch (err) {
            console.error("Error activating semester:", err);
            setErrMsg("Failed to activate semester.");
        }
    };

    const openActivateModal = (semester) => {
        setSelectedSemester(semester);
        setShowActivateModal(true);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <AdminSidebar userId={userId} />

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Link to="/admin-sessions" className="hover:underline">Academic Sessions</Link>
                            <FaChevronRight className="mx-2" />
                            <span className="font-medium text-gray-800">{session?.title || "Session"}</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            {currentUser?.role === 'level_admin' ? 'My Semesters' : 'Manage Semesters'}
                        </h2>
                        <p className="text-gray-500 mt-1">
                            {currentUser?.role === 'level_admin'
                                ? "View and manage the semesters you have created in this session."
                                : "Manage all semesters in this academic session."
                            }
                        </p>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                        <FaPlus className="mr-2" /> Add New Semester
                    </button>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        {!Array.isArray(semesters) || semesters.length === 0 ? (
                            <div className="text-center py-12">
                                <FaCalendarAlt className="text-gray-400 text-4xl mb-4 mx-auto" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                    {currentUser?.role === 'level_admin' ? 'No Semesters Created Yet' : 'No Semesters Available'}
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {currentUser?.role === 'level_admin'
                                        ? "You haven't created any semesters in this session yet. Click 'Add New Semester' to get started."
                                        : "No semesters have been created for this session yet."
                                    }
                                </p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    <FaPlus className="mr-2" /> Add Your First Semester
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {currentUser?.role === 'level_admin'
                                                ? `Your Semesters (${Array.isArray(semesters) ? semesters.length : 0})`
                                                : `All Semesters (${Array.isArray(semesters) ? semesters.length : 0})`
                                            }
                                        </h3>
                                        {currentUser?.role === 'level_admin' && (
                                            <p className="text-sm text-gray-600">
                                                Only semesters you created are shown here.
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <ul className="divide-y divide-gray-200">
                                    {Array.isArray(semesters) && semesters.map((semester) => (
                                        <li key={semester.id} className="py-4 flex items-center justify-between">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-800 capitalize">{semester.semester} Semester</h4>
                                                <p className="text-gray-500">Contains {semester.courses?.length || 0} courses.</p>
                                                {currentUser?.role === 'level_admin' && (
                                                    <p className="text-xs text-blue-600 mt-1">Created by you</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${semester.status === "active"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                                    }`}>
                                                    {semester.status}
                                                </span>
                                                <Link to={`/semester/${semester.id}`} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                                                    View Courses
                                                </Link>
                                                {semester.status === "inactive" && (
                                                    <button onClick={() => openActivateModal(semester)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                                        Activate
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Add Semester Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">
                                {currentUser?.role === 'level_admin' ? 'Add New Semester' : 'Add New Semester'}
                            </h3>
                            <button onClick={() => setShowAddModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAddSemester}>
                            {errMsg && <p className="text-red-500 mb-4">{errMsg}</p>}
                            <label htmlFor="semesterTitle" className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                            {isCustomSemester ? (
                                <input
                                    id="semesterTitle"
                                    type="text"
                                    value={newSemesterTitle}
                                    onChange={(e) => setNewSemesterTitle(e.target.value)}
                                    placeholder="e.g., Summer, Remedial"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    autoFocus
                                />
                            ) : (
                                <select
                                    id="semesterTitle"
                                    value={newSemesterTitle}
                                    onChange={(e) => setNewSemesterTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Semester</option>
                                    <option value="First">First Semester</option>
                                    <option value="Second">Second Semester</option>
                                    <option value="Third">Third Semester</option>
                                    <option value="Fourth">Fourth Semester</option>
                                </select>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setIsCustomSemester(!isCustomSemester);
                                    setNewSemesterTitle("");
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 mt-2 underline focus:outline-none"
                            >
                                {isCustomSemester ? "Select from list" : "Add another semester"}
                            </button>
                            {currentUser?.role === 'level_admin' && (
                                <p className="text-sm text-blue-600 mt-2">
                                    This semester will be created under your account and only visible to you.
                                </p>
                            )}
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                    Create Semester
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Activate Semester Confirmation Modal */}
            {showActivateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold mb-4">Confirm Activation</h3>
                        <p>Are you sure you want to activate the <span className="font-bold capitalize">{selectedSemester?.semester}</span> semester? This will deactivate any other active semester in this session.</p>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setShowActivateModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                                Cancel
                            </button>
                            <button onClick={handleActivateSemester} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                Yes, Activate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Session;
