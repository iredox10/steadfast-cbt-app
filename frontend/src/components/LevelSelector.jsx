import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { path } from '../../utils/path'

const LevelSelector = ({ currentUser, selectedLevel, onLevelChange, showAllOption = false, allOptionText = "All Levels" }) => {
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
            const response = await axios.get(`${path}/departments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (Array.isArray(response.data)) {
                setAcademicSessions(response.data);
            } else {
                setAcademicSessions([]);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
            setAcademicSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const getAvailableLevels = () => {
        if (!currentUser) return [];
        
        if (currentUser.role === 'super_admin') {
            return academicSessions;
        } else if (currentUser.role === 'faculty_officer') {
            return academicSessions.filter(dept => String(dept.faculty_id) === String(currentUser.faculty_id));
        } else if (currentUser.role === 'level_admin' && currentUser.level_id) {
            return academicSessions.filter(session => String(session.id) === String(currentUser.level_id));
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
            <label className="text-sm font-medium text-gray-700">Department/Level:</label>
            <select
                value={selectedLevel}
                onChange={(e) => onLevelChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {showAllOption && (currentUser?.role === 'super_admin' || currentUser?.role === 'faculty_officer') && (
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
