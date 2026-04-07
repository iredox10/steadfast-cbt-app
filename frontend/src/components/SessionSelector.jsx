import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { path } from '../../utils/path'

const SessionSelector = ({ currentUser, selectedSession, onSessionChange, showAllOption = false, allOptionText = "All Sessions" }) => {
    const [academicSessions, setAcademicSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchAcademicSessions();
        }
    }, [currentUser]);

    const fetchAcademicSessions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${path}/get-acd-sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (Array.isArray(response.data)) {
                setAcademicSessions(response.data);
            } else {
                setAcademicSessions([]);
            }
        } catch (error) {
            console.error('Error fetching academic sessions:', error);
            setAcademicSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const getAvailableSessions = () => {
        if (!currentUser) return [];
        return academicSessions;
    };

    const availableSessions = getAvailableSessions();

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-48"></div>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Academic Session:</label>
            <select
                value={selectedSession}
                onChange={(e) => onSessionChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {showAllOption && (
                    <option value="">{allOptionText}</option>
                )}
                {availableSessions.map(session => (
                    <option key={session.id} value={session.id}>
                        {session.title}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SessionSelector;
