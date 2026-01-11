import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { path } from '../../utils/path';
import { FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';

const ExamSecurityContext = createContext(null);

export const useExamSecurity = () => {
    const context = useContext(ExamSecurityContext);
    if (!context) {
        throw new Error('useExamSecurity must be used within ExamSecurityProvider');
    }
    return context;
};

/**
 * ExamSecurityProvider - Enforces browser lockdown during exams
 * 
 * Features:
 * - Fullscreen enforcement
 * - Tab switch detection
 * - Copy/paste blocking
 * - Screenshot prevention
 * - Right-click blocking
 * - DevTools blocking
 * - Multiple monitor detection
 * - Violation logging and auto-submit
 */
const ExamSecurityProvider = ({
    children,
    studentId,
    examId,
    securitySettings = {},
    onAutoSubmit,
    enabled = true
}) => {
    const [violations, setViolations] = useState([]);
    const [serverViolationCount, setServerViolationCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [multipleMonitorsDetected, setMultipleMonitorsDetected] = useState(false);
    const [fullscreenRequired, setFullscreenRequired] = useState(false);
    const [penaltyActive, setPenaltyActive] = useState(false);
    const [penaltySeconds, setPenaltySeconds] = useState(0);
    const [penaltyType, setPenaltyType] = useState('');

    // Default security settings (can be overridden)
    const settings = {
        enable_fullscreen: true,
        enable_tab_switch_detection: true,
        enable_copy_paste_block: true,
        enable_screenshot_block: true,
        enable_multiple_monitor_check: true,
        max_violations: 3,
        ...securitySettings
    };

    /**
     * Log a violation to the backend
     */
    const logViolation = useCallback(async (violationType, details = {}) => {
        if (!enabled || !studentId || !examId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${path}/log-violation`,
                {
                    student_id: studentId,
                    exam_id: examId,
                    violation_type: violationType,
                    details
                },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                }
            );

            setViolations(prev => [...prev, response.data.violation]);
            if (response.data.violation_count) {
                setServerViolationCount(response.data.violation_count);
            }

            // Check if should auto-submit
            if (response.data.should_auto_submit) {
                showWarningModal(
                    `Maximum violations (${settings.max_violations}) reached. Your exam will be submitted automatically.`,
                    true
                );

                // Auto-submit after 5 seconds
                setTimeout(() => {
                    if (onAutoSubmit) {
                        onAutoSubmit();
                    }
                }, 5000);
            } else {
                showWarningModal(
                    `Security Violation Detected: ${violationType.replace('_', ' ').toUpperCase()}. Violation ${response.data.violation_count} of ${settings.max_violations}.`
                );
            }

            // Trigger penalty for tab switch or fullscreen exit
            if (violationType === 'tab_switch' || violationType === 'fullscreen_exit') {
                startPenalty(violationType === 'tab_switch' ? 'Tab Switch' : 'Fullscreen Exit');
            }

            console.warn('Security Violation:', violationType, details);
        } catch (error) {
            console.error('Error logging violation:', error);
        }
    }, [enabled, studentId, examId, settings.max_violations, onAutoSubmit]);

    /**
     * Start a penalty timer
     */
    const startPenalty = (type) => {
        setPenaltyType(type);
        setPenaltySeconds(10);
        setPenaltyActive(true);
    };

    /**
     * Penalty timer effect
     */
    useEffect(() => {
        let interval;
        if (penaltyActive && penaltySeconds > 0) {
            interval = setInterval(() => {
                setPenaltySeconds(prev => prev - 1);
            }, 1000);
        } else if (penaltySeconds === 0) {
            setPenaltyActive(false);
        }
        return () => clearInterval(interval);
    }, [penaltyActive, penaltySeconds]);

    /**
     * Show warning modal
     */
    const showWarningModal = (message, isCritical = false) => {
        setWarningMessage(message);
        setShowWarning(true);

        if (!isCritical) {
            setTimeout(() => {
                setShowWarning(false);
            }, 5000);
        }
    };

    const triggerFullscreen = async () => {
        try {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                await elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                await elem.msRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                await elem.mozRequestFullScreen();
            }
            setIsFullscreen(true);
            setFullscreenRequired(false);
        } catch (error) {
            console.error('Fullscreen request failed:', error);
            setFullscreenRequired(true);
        }
    };

    /**
     * Fullscreen enforcement
     */
    useEffect(() => {
        if (!enabled || !settings.enable_fullscreen) return;

        const enterFullscreen = async () => {
            try {
                const elem = document.documentElement;
                if (elem.requestFullscreen) {
                    await elem.requestFullscreen();
                } else if (elem.webkitRequestFullscreen) {
                    await elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) {
                    await elem.msRequestFullscreen();
                } else if (elem.mozRequestFullScreen) {
                    await elem.mozRequestFullScreen();
                }
                setIsFullscreen(true);
            } catch (error) {
                console.error('Fullscreen request failed on mount:', error);
                setFullscreenRequired(true);
            }
        };

        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement ||
                document.mozFullScreenElement
            );

            setIsFullscreen(isCurrentlyFullscreen);

            if (!isCurrentlyFullscreen && enabled && settings.enable_fullscreen) {
                logViolation('fullscreen_exit', {
                    timestamp: new Date().toISOString()
                });
                setFullscreenRequired(true);
            } else {
                setFullscreenRequired(false);
            }
        };

        // Enter fullscreen on mount
        enterFullscreen();

        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        };
    }, [enabled, settings.enable_fullscreen, logViolation]);

    /**
     * Tab switch / window blur detection
     */
    useEffect(() => {
        if (!enabled || !settings.enable_tab_switch_detection) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                logViolation('tab_switch', {
                    timestamp: new Date().toISOString(),
                    hidden: document.hidden
                });
            }
        };

        const handleBlur = () => {
            logViolation('tab_switch', {
                timestamp: new Date().toISOString(),
                event: 'window_blur'
            });
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
        };
    }, [enabled, settings.enable_tab_switch_detection, logViolation]);

    /**
     * Copy/paste blocking
     */
    useEffect(() => {
        if (!enabled || !settings.enable_copy_paste_block) return;

        const handleCopy = (e) => {
            e.preventDefault();
            logViolation('copy_attempt', {
                timestamp: new Date().toISOString()
            });
            return false;
        };

        const handlePaste = (e) => {
            e.preventDefault();
            logViolation('paste_attempt', {
                timestamp: new Date().toISOString()
            });
            return false;
        };

        const handleCut = (e) => {
            e.preventDefault();
            logViolation('copy_attempt', {
                timestamp: new Date().toISOString(),
                type: 'cut'
            });
            return false;
        };

        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('cut', handleCut);

        return () => {
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('cut', handleCut);
        };
    }, [enabled, settings.enable_copy_paste_block, logViolation]);

    /**
     * Screenshot prevention & DevTools blocking
     */
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e) => {
            // Block PrintScreen
            if (settings.enable_screenshot_block && e.key === 'PrintScreen') {
                e.preventDefault();
                logViolation('screenshot_attempt', {
                    timestamp: new Date().toISOString(),
                    key: 'PrintScreen'
                });
                return false;
            }

            // Block Windows Snipping Tool (Win + Shift + S)
            if (settings.enable_screenshot_block &&
                e.key === 's' && e.shiftKey && e.metaKey) {
                e.preventDefault();
                logViolation('screenshot_attempt', {
                    timestamp: new Date().toISOString(),
                    key: 'Win+Shift+S'
                });
                return false;
            }

            // Block Mac screenshot shortcuts
            if (settings.enable_screenshot_block &&
                ((e.key === '3' && e.shiftKey && e.metaKey) ||
                    (e.key === '4' && e.shiftKey && e.metaKey) ||
                    (e.key === '5' && e.shiftKey && e.metaKey))) {
                e.preventDefault();
                logViolation('screenshot_attempt', {
                    timestamp: new Date().toISOString(),
                    key: 'Mac screenshot shortcut'
                });
                return false;
            }

            // Block F12 (DevTools)
            if (e.key === 'F12') {
                e.preventDefault();
                logViolation('devtools_attempt', {
                    timestamp: new Date().toISOString(),
                    key: 'F12'
                });
                return false;
            }

            // Block Ctrl+Shift+I / Cmd+Option+I (DevTools)
            if ((e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.metaKey && e.altKey && e.key === 'I')) {
                e.preventDefault();
                logViolation('devtools_attempt', {
                    timestamp: new Date().toISOString(),
                    key: 'DevTools shortcut'
                });
                return false;
            }

            // Block Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
            if ((e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.metaKey && e.altKey && e.key === 'C')) {
                e.preventDefault();
                logViolation('devtools_attempt', {
                    timestamp: new Date().toISOString(),
                    key: 'Inspect Element shortcut'
                });
                return false;
            }

            // Block Ctrl+U / Cmd+Option+U (View Source)
            if ((e.ctrlKey && e.key === 'U') ||
                (e.metaKey && e.altKey && e.key === 'U')) {
                e.preventDefault();
                logViolation('devtools_attempt', {
                    timestamp: new Date().toISOString(),
                    key: 'View Source shortcut'
                });
                return false;
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [enabled, settings.enable_screenshot_block, logViolation]);

    /**
     * Right-click context menu blocking
     */
    useEffect(() => {
        if (!enabled || !settings.enable_copy_paste_block) return;

        const handleContextMenu = (e) => {
            e.preventDefault();
            logViolation('right_click', {
                timestamp: new Date().toISOString()
            });
            return false;
        };

        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [enabled, settings.enable_copy_paste_block, logViolation]);

    /**
     * Multiple monitor detection
     */
    useEffect(() => {
        if (!enabled || !settings.enable_multiple_monitor_check) return;

        const checkMultipleMonitors = async () => {
            try {
                if (window.screen && window.screen.isExtended !== undefined) {
                    if (window.screen.isExtended) {
                        setMultipleMonitorsDetected(true);
                        logViolation('multiple_monitors_detected', {
                            timestamp: new Date().toISOString(),
                            screen_count: 'extended'
                        });
                    }
                } else if (window.screen) {
                    // Fallback: Check screen dimensions ratio
                    const aspectRatio = window.screen.width / window.screen.height;
                    // Ultra-wide or multi-monitor setups typically have aspect ratios > 2.5
                    if (aspectRatio > 2.5) {
                        setMultipleMonitorsDetected(true);
                        logViolation('multiple_monitors_detected', {
                            timestamp: new Date().toISOString(),
                            aspect_ratio: aspectRatio
                        });
                    }
                }
            } catch (error) {
                console.error('Error detecting multiple monitors:', error);
            }
        };

        checkMultipleMonitors();
    }, [enabled, settings.enable_multiple_monitor_check, logViolation]);

    // Re-check monitors periodically
    useEffect(() => {
        if (!enabled || !settings.enable_multiple_monitor_check) return;

        const interval = setInterval(() => {
            if (window.screen && window.screen.isExtended !== undefined) {
                setMultipleMonitorsDetected(window.screen.isExtended);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [enabled, settings.enable_multiple_monitor_check]);

    const value = {
        violations,
        isFullscreen,
        multipleMonitorsDetected,
        settings,
        violationCount: serverViolationCount || violations.length
    };

    return (
        <ExamSecurityContext.Provider value={value}>
            {children}

            {/* Fullscreen Required Modal */}
            {enabled && settings.enable_fullscreen && fullscreenRequired && !isFullscreen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-95 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fullscreen Required</h2>
                        <p className="text-gray-600 mb-8">
                            To ensure exam integrity, this exam must be taken in fullscreen mode.
                        </p>
                        <button
                            onClick={triggerFullscreen}
                            className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                        >
                            Enter Fullscreen Mode
                        </button>
                    </div>
                </div>
            )}

            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                <FaExclamationTriangle className="text-red-600 text-3xl" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                            Security Warning
                        </h3>
                        <p className="text-gray-700 text-center mb-6">
                            {warningMessage}
                        </p>
                        {violations.length < settings.max_violations && (
                            <button
                                onClick={() => setShowWarning(false)}
                                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                I Understand
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Security Status Indicator */}
            {enabled && (
                <div className="fixed bottom-4 left-4 z-40">
                    <div className="bg-white rounded-lg shadow-lg p-3 flex items-center space-x-2 border border-gray-200">
                        <FaShieldAlt className={`${isFullscreen ? 'text-green-600' : 'text-yellow-600'}`} />
                        <span className="text-sm font-medium text-gray-700">
                            Violations: {serverViolationCount || violations.length}/{settings.max_violations}
                        </span>
                    </div>
                </div>
            )}

            {/* Penalty Overlay */}
            {penaltyActive && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-red-900 bg-opacity-95 backdrop-blur-md">
                    <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full mx-4 text-center border-t-8 border-red-600">
                        <div className="mb-6 flex justify-center">
                            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center animate-bounce">
                                <FaExclamationTriangle className="text-4xl text-red-600" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Penalty</h2>
                        <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                            You violated the security policy: <span className="font-bold text-red-600">{penaltyType}</span>.
                            <br />
                            A temporary lock has been applied. You can resume in:
                        </p>
                        <div className="inline-block px-8 py-4 bg-gray-900 text-white rounded-2xl text-4xl font-mono font-bold shadow-inner">
                            {penaltySeconds}s
                        </div>
                        <p className="mt-8 text-sm text-gray-500 italic">
                            Further violations will result in automatic exam submission.
                        </p>
                    </div>
                </div>
            )}

            {/* Multiple Monitors Block */}
            {enabled && settings.enable_multiple_monitor_check && multipleMonitorsDetected && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900 bg-opacity-98 backdrop-blur-xl">
                    <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full mx-4 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Multiple Displays Detected</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            A secondary monitor has been detected. Please disconnect all external displays or disable screen mirroring to continue the exam.
                        </p>
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <p className="text-xs text-indigo-700 font-medium">
                                This screen will disappear automatically once the secondary monitor is disconnected.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </ExamSecurityContext.Provider>
    );
};

export default ExamSecurityProvider;
