import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaCog, FaGlobe, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
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
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <FaGlobe className="text-blue-600 text-2xl" />
                        <h1 className="text-3xl font-bold text-gray-900">Global Academic Session</h1>
                    </div>
                    <p className="text-gray-600">
                        Set the active academic session for the entire system. Level admins can then add courses within this session.
                    </p>
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
                                        className={`border rounded-lg p-6 transition-all duration-200 ${
                                            globalActiveSession?.id === session.id
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
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                session.status 
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
        </div>
    );
};

export default GlobalSessionManagement;
