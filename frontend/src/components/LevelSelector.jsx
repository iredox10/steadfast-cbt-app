import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { path } from '../../utils/path'

const LevelSelector = ({ currentUser, selectedLevel, onLevelChange, showAllOption = false, allOptionText = "All Levels" }) => {
    const [academicSessions, setAcademicSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAcademicSessions();
    }, []);

    const fetchAcademicSessions = async () => {
        try {
            const response = await axios.get(`${path}/get-acd-sessions`);
            console.log('Academic sessions response:', response.data);
            
            // Ensure we have an array
            if (Array.isArray(response.data)) {
                setAcademicSessions(response.data);
            } else {
                console.error('Academic sessions response is not an array:', response.data);
                setAcademicSessions([]);
            }
        } catch (error) {
            console.error('Error fetching academic sessions:', error);
            console.error('Error response:', error.response?.data);
            setAcademicSessions([]);
        } finally {
            setLoading(false);
        }
    };

    // Super admin can see all levels, level admin only sees their assigned level
    const getAvailableLevels = () => {
        if (currentUser?.role === 'super_admin') {
            return academicSessions;
        } else if (currentUser?.role === 'level_admin' && currentUser?.level_id) {
            return academicSessions.filter(session => session.id === currentUser.level_id);
        }
        return [];
    };

    const availableLevels = getAvailableLevels();

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-48"></div>
            </div>
        );
    }

    // If user is level admin and only has one level, don't show selector
    if (currentUser?.role === 'level_admin' && availableLevels.length === 1 && !showAllOption) {
        return null;
    }

    return (
        <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Academic Session:</label>
            <select
                value={selectedLevel}
                onChange={(e) => onLevelChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {showAllOption && currentUser?.role === 'super_admin' && (
                    <option value="">{allOptionText}</option>
                )}
                {availableLevels.map(session => (
                    <option key={session.id} value={session.id}>
                        {session.title}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LevelSelector;
