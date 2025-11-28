import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaCog, FaGlobe, FaExclamationTriangle, FaPlus, FaTimes } from 'react-icons/fa';
import AdminSidebar from '../../components/AdminSidebar';
import axios from 'axios';
import { path } from '../../../utils/path';

const GlobalSessionManagement = () => {
    const [sessions, setSessions] = useState([]);
    const [globalActiveSession, setGlobalActiveSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSessions();
        fetchGlobalActiveSession();
    }, []);

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${path}/get-acd-sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(response.data);
        } catch (err) {
            setError('Failed to fetch academic sessions');
            console.error(err);
        }
    };

    const fetchGlobalActiveSession = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${path}/get-global-session`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGlobalActiveSession(response.data);
        } catch (err) {
            // It's okay if no global session is set yet
            console.log('No global session set yet');
        } finally {
            setLoading(false);
        }
    };

    const setGlobalSession = async (sessionId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${path}/set-global-session/${sessionId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSuccess('Global academic session set successfully!');
            setError('');
            await fetchGlobalActiveSession();
            await fetchSessions(); // Refresh to show updated status
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to set global session');
            setSuccess('');
        } finally {
            setLoading(false);
        }
    };

    const [showAddModal, setShowAddModal] = useState(false);
    const [newSessionTitle, setNewSessionTitle] = useState("");
    const [selectedYear, setSelectedYear] = useState("");

    const handleAddSession = async (e) => {
        e.preventDefault();
        if (!selectedYear) {
            setError("Please select a year.");
            return;
        }
        setError("");

        const year = parseInt(selectedYear);
        const sessionTitle = `${year}/${year + 1}`;

        try {
            setLoading(true);
            await axios.post(`${path}/add-acd-session`, { title: sessionTitle, status: "inactive" });
            setShowAddModal(false);
            setSelectedYear("");
            setNewSessionTitle("");
            setSuccess("Session created successfully!");
            fetchSessions(); // Refetch to show the new session
        } catch (err) {
            console.error("Error adding session:", err);
            setError(err.response?.data || "Failed to add session.");
        } finally {
            setLoading(false);
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

    if (loading && sessions.length === 0) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <FaGlobe className="text-blue-600 text-2xl" />
                            <h1 className="text-3xl font-bold text-gray-900">Global Academic Session</h1>
                        </div>
                        <p className="text-gray-600">
                            Set the active academic session for the entire system. Level admins can then add courses within this session.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FaPlus className="mr-2" /> Add New Session
                    </button>
                </div>

                {/* Current Global Session Card */}
                {globalActiveSession && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <FaCheckCircle className="text-green-600 text-xl" />
                            <h2 className="text-xl font-semibold text-green-800">Current Global Session</h2>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                            <h3 className="text-lg font-semibold text-gray-900">{globalActiveSession.title}</h3>
                            {globalActiveSession.description && (
                                <p className="text-gray-600 mt-1">{globalActiveSession.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                <span>Status: <span className="text-green-600 font-medium">Active</span></span>
                                <span>Set on: {new Date(globalActiveSession.updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alerts */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2">
                            <FaExclamationTriangle className="text-red-600" />
                            <span className="text-red-800">{error}</span>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-green-600" />
                            <span className="text-green-800">{success}</span>
                        </div>
                    </div>
                )}

                {/* No Global Session Warning */}
                {!globalActiveSession && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <FaExclamationTriangle className="text-yellow-600 text-xl" />
                            <h2 className="text-lg font-semibold text-yellow-800">No Global Session Set</h2>
                        </div>
                        <p className="text-yellow-700">
                            Please select an academic session below to activate it system-wide. Level admins won't be able to add courses until a global session is set.
                        </p>
                    </div>
                )}

                {/* Sessions List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Available Academic Sessions</h2>
                        <p className="text-gray-600 mt-1">Select a session to set as the global active session</p>
                    </div>

                    <div className="p-6">
                        {sessions.length === 0 ? (
                            <div className="text-center py-12">
                                <FaCalendarAlt className="text-gray-300 text-5xl mb-4 mx-auto" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No Academic Sessions</h3>
                                <p className="text-gray-600 mb-6">Create an academic session first to set as global.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={`border rounded-lg p-6 transition-all duration-200 ${globalActiveSession?.id === session.id
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 text-lg">{session.title}</h3>
                                                {session.description && (
                                                    <p className="text-gray-600 text-sm mt-1">{session.description}</p>
                                                )}
                                            </div>
                                            {globalActiveSession?.id === session.id && (
                                                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                    <FaCheckCircle className="text-xs" />
                                                    Global
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {session.status ? 'Active' : 'Inactive'}
                                            </span>

                                            {globalActiveSession?.id !== session.id && (
                                                <button
                                                    onClick={() => setGlobalSession(session.id)}
                                                    disabled={loading}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                >
                                                    {loading ? 'Setting...' : 'Set as Global'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                    <div className="flex items-start gap-3">
                        <FaCog className="text-blue-600 text-xl mt-1" />
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-2">How Global Sessions Work</h3>
                            <ul className="text-blue-800 text-sm space-y-1">
                                <li>• Super admins set one global academic session for the entire system</li>
                                <li>• Level admins can only add courses within the active global session</li>
                                <li>• All course assignments must be within the current global session</li>
                                <li>• Changing the global session affects all level admins system-wide</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Session Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Add New Session</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleAddSession}>
                            <div className="mb-4">
                                <label htmlFor="sessionYear" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Academic Year
                                </label>
                                <select
                                    id="sessionYear"
                                    value={selectedYear}
                                    onChange={handleYearChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Session will be created as:</p>
                                    <p className="text-lg font-bold text-blue-800">{newSessionTitle}</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setSelectedYear("");
                                        setNewSessionTitle("");
                                        setError("");
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                                    disabled={!selectedYear || loading}
                                >
                                    {loading ? 'Creating...' : 'Create Session'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalSessionManagement;
