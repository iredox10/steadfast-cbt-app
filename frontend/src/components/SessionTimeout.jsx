import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaExclamationTriangle, FaSignOutAlt, FaClock } from 'react-icons/fa';

const SessionTimeout = ({ timeoutInMinutes = 30 }) => {
    const [showWarning, setShowAddWarning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(60); // 60 seconds warning
    const navigate = useNavigate();
    const location = useLocation();
    
    const timeoutRef = useRef(null);
    const warningTimeoutRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setShowAddWarning(false);
        // Clear all timers
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        
        // Only redirect if not already on login or home
        if (location.pathname !== '/admin-login' && location.pathname !== '/') {
            navigate('/admin-login');
        }
    }, [navigate, location.pathname]);

    const resetTimer = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Clear existing timeouts
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        
        setShowAddWarning(false);

        // Set warning timeout (timeout - 1 minute)
        const warningTime = (timeoutInMinutes * 60 * 1000) - 60000;
        
        warningTimeoutRef.current = setTimeout(() => {
            setShowAddWarning(true);
            setRemainingTime(60);
            
            // Start countdown for the last minute
            countdownIntervalRef.current = setInterval(() => {
                setRemainingTime(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownIntervalRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }, warningTime);

        // Set final logout timeout
        timeoutRef.current = setTimeout(() => {
            logout();
        }, timeoutInMinutes * 60 * 1000);
    }, [timeoutInMinutes, logout]);

    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        const handleEvent = () => {
            resetTimer();
        };

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, handleEvent);
        });

        // Initialize timer
        resetTimer();

        // Cleanup
        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleEvent);
            });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, [resetTimer]);

    // Don't show anything if no token (user not logged in) or if already on login/home page
    const token = localStorage.getItem('token');
    if (!token || location.pathname === '/admin-login' || location.pathname === '/') {
        return null;
    }

    if (!showWarning) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in fade-in zoom-in duration-300">
                <div className="bg-amber-500 p-6 text-white flex items-center gap-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                        <FaClock className="text-3xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Session Expiring</h2>
                        <p className="text-amber-50 text-sm opacity-90">Inactivity detected</p>
                    </div>
                </div>
                
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaExclamationTriangle className="text-amber-600 text-4xl" />
                    </div>
                    
                    <p className="text-gray-700 text-lg mb-2">Your session is about to expire due to inactivity.</p>
                    <p className="text-gray-500 mb-8">You will be logged out automatically in:</p>
                    
                    <div className="text-5xl font-black text-blue-600 mb-8 tracking-tighter">
                        {remainingTime}<span className="text-xl ml-1 text-gray-400">seconds</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={logout}
                            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                        >
                            <FaSignOutAlt /> Logout Now
                        </button>
                        <button
                            onClick={resetTimer}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-95"
                        >
                            Stay Logged In
                        </button>
                    </div>
                </div>
                
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-center">
                    <p className="text-xs text-gray-400 font-medium">STEDFAST CBT - SECURITY SYSTEM</p>
                </div>
            </div>
        </div>
    );
};

export default SessionTimeout;
