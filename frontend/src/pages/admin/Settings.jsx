import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { path } from '../../../utils/path';
import AdminSidebar from '../../components/AdminSidebar';
import { FaCog, FaSave, FaToggleOn, FaToggleOff, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const Settings = () => {
    const { userId } = useParams();
    const [settings, setSettings] = useState({
        student_see_result: false,
        student_registration_enabled: true,
        allow_instructor_enrollment: false, // Default
        // Security settings
        enable_browser_lockdown: true,
        enable_fullscreen: true,
        enable_tab_switch_detection: true,
        enable_copy_paste_block: true,
        enable_screenshot_block: true,
        enable_multiple_monitor_check: true,
        max_violations: 3
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    
    // Password visibility state
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch both settings and user profile
            const [settingsResponse, userResponse] = await Promise.all([
                axios.get(`${path}/system-settings`, { headers }),
                axios.get(`${path}/user`, { headers })
            ]);

            const userData = userResponse.data;
            let levelSettings = {};

            // If level admin, fetch their session settings
            if (userData.role === 'level_admin' && userData.level_id) {
                try {
                    const sessionRes = await axios.get(`${path}/get-acd-session/${userData.level_id}`, { headers });
                    levelSettings = {
                        allow_instructor_enrollment: !!sessionRes.data.allow_instructor_enrollment
                    };
                } catch (err) {
                    console.error("Error fetching session settings:", err);
                }
            }

            // Ensure we have default values
            setSettings({
                student_see_result: false,
                student_registration_enabled: true,
                allow_instructor_enrollment: false,
                ...settingsResponse.data,
                ...levelSettings,
                role: userData.role, // Add role from user profile
                level_id: userData.level_id
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (key, value = null) => {
        const newValue = value !== null ? value : !settings[key];

        // Optimistic update
        setSettings(prev => ({ ...prev, [key]: newValue }));

        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            await axios.post(`${path}/system-settings`, {
                key,
                value: newValue
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ type: 'success', text: 'Setting updated successfully' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error updating setting:', error);
            // Revert on error
            setSettings(prev => ({ ...prev, [key]: value !== null ? !value : !newValue }));
            setMessage({ type: 'error', text: 'Failed to update setting' });
        } finally {
            setSaving(false);
        }
    };

    const handleLevelToggle = async () => {
        const newValue = !settings.allow_instructor_enrollment;
        
        // Optimistic update
        setSettings(prev => ({ ...prev, allow_instructor_enrollment: newValue }));

        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            await axios.put(`${path}/departments/${settings.level_id}/toggle-enrollment`, {
                allow_instructor_enrollment: newValue
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ type: 'success', text: 'Level setting updated successfully' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error updating level setting:', error);
            // Revert on error
            setSettings(prev => ({ ...prev, allow_instructor_enrollment: !newValue }));
            setMessage({ type: 'error', text: 'Failed to update level setting' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${path}/change-password`, passwordData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ type: 'success', text: 'Password changed successfully' });
            setPasswordData({
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.error || error.response?.data?.message || 'Failed to change password'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar userId={userId} />

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                            <FaCog className="mr-3 text-gray-600" />
                            System Settings
                        </h2>
                        <p className="text-gray-500 mt-2">Manage global system configurations and account settings</p>
                    </div>
                </header>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Level Configuration - Level Admin Only */}
                    {settings.role === 'level_admin' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">Level Configuration</h3>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Instructor Enrollment Toggle */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Instructor Enrollment</h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Allow instructors to enroll students in their courses.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleLevelToggle}
                                        disabled={saving}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.allow_instructor_enrollment ? 'bg-blue-600' : 'bg-gray-200'}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.allow_instructor_enrollment ? 'translate-x-6' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* System Configuration - Super Admin Only */}
                    {settings.role === 'super_admin' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">System Configuration</h3>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Student Result Toggle */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Show Exam Results</h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Allow students to see their score immediately after submission.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleToggle('student_see_result')}
                                        disabled={saving}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.student_see_result ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.student_see_result ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Student Registration Toggle */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Student Registration</h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Enable or disable new student registrations.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleToggle('student_registration_enabled')}
                                        disabled={saving}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.student_registration_enabled ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.student_registration_enabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Exam Security Settings */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                        <FaCog className="mr-2 text-gray-600" />
                                        Exam Security (Browser Lockdown)
                                    </h4>
                                    <p className="text-xs text-gray-500 mb-4">
                                        Configure global defaults for exam security. These settings apply to all new exams.
                                    </p>

                                    {/* Master Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mb-3">
                                        <div>
                                            <h5 className="font-medium text-gray-900">Enable Browser Lockdown</h5>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Master switch for all exam security features
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleToggle('enable_browser_lockdown')}
                                            disabled={saving}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.enable_browser_lockdown ? 'bg-blue-600' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enable_browser_lockdown ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    {/* Individual Features */}
                                    {settings.enable_browser_lockdown && (
                                        <div className="space-y-2 ml-4 pl-4 border-l-2 border-blue-200">
                                            {/* Fullscreen */}
                                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h6 className="text-sm font-medium text-gray-900">Fullscreen Mode</h6>
                                                    <p className="text-xs text-gray-500">Force fullscreen during exam</p>
                                                </div>
                                                <button
                                                    onClick={() => handleToggle('enable_fullscreen')}
                                                    disabled={saving}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.enable_fullscreen ? 'bg-green-600' : 'bg-gray-300'}`}
                                                >
                                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.enable_fullscreen ? 'translate-x-5' : 'translate-x-1'}`} />
                                                </button>
                                            </div>

                                            {/* Tab Switch Detection */}
                                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h6 className="text-sm font-medium text-gray-900">Tab Switch Detection</h6>
                                                    <p className="text-xs text-gray-500">Detect window/tab changes</p>
                                                </div>
                                                <button
                                                    onClick={() => handleToggle('enable_tab_switch_detection')}
                                                    disabled={saving}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.enable_tab_switch_detection ? 'bg-green-600' : 'bg-gray-300'}`}
                                                >
                                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.enable_tab_switch_detection ? 'translate-x-5' : 'translate-x-1'}`} />
                                                </button>
                                            </div>

                                            {/* Copy/Paste Block */}
                                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h6 className="text-sm font-medium text-gray-900">Copy/Paste Block</h6>
                                                    <p className="text-xs text-gray-500">Disable clipboard & right-click</p>
                                                </div>
                                                <button
                                                    onClick={() => handleToggle('enable_copy_paste_block')}
                                                    disabled={saving}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.enable_copy_paste_block ? 'bg-green-600' : 'bg-gray-300'}`}
                                                >
                                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.enable_copy_paste_block ? 'translate-x-5' : 'translate-x-1'}`} />
                                                </button>
                                            </div>

                                            {/* Screenshot Block */}
                                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h6 className="text-sm font-medium text-gray-900">Screenshot Prevention</h6>
                                                    <p className="text-xs text-gray-500">Block PrintScreen shortcuts</p>
                                                </div>
                                                <button
                                                    onClick={() => handleToggle('enable_screenshot_block')}
                                                    disabled={saving}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.enable_screenshot_block ? 'bg-green-600' : 'bg-gray-300'}`}
                                                >
                                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.enable_screenshot_block ? 'translate-x-5' : 'translate-x-1'}`} />
                                                </button>
                                            </div>

                                            {/* Monitor Detection */}
                                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h6 className="text-sm font-medium text-gray-900">Monitor Detection</h6>
                                                    <p className="text-xs text-gray-500">Warn about multiple displays</p>
                                                </div>
                                                <button
                                                    onClick={() => handleToggle('enable_multiple_monitor_check')}
                                                    disabled={saving}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.enable_multiple_monitor_check ? 'bg-green-600' : 'bg-gray-300'}`}
                                                >
                                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.enable_multiple_monitor_check ? 'translate-x-5' : 'translate-x-1'}`} />
                                                </button>
                                            </div>

                                            {/* Max Violations */}
                                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                                    Max Violations
                                                </label>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    Auto-submit after this many violations
                                                </p>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={settings.max_violations || 3}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value);
                                                        if (value >= 1 && value <= 10) {
                                                            handleToggle('max_violations', value);
                                                        }
                                                    }}
                                                    className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account Settings (Password Change) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            required
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-10"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            required
                                            minLength={6}
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-10"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            minLength={6}
                                            value={passwordData.new_password_confirmation}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-10"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                                    >
                                        {loading ? 'Updating...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
