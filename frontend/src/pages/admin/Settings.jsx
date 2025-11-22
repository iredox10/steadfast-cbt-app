import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { path } from '../../../utils/path';
import AdminSidebar from '../../components/AdminSidebar';
import { FaCog, FaSave, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const Settings = () => {
    const { userId } = useParams();
    const [settings, setSettings] = useState({
        student_see_result: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

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
            const response = await axios.get(`${path}/system-settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Ensure we have default values
            setSettings({
                student_see_result: false,
                student_registration_enabled: true,
                ...response.data
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (key) => {
        const newValue = !settings[key];

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
            setSettings(prev => ({ ...prev, [key]: !newValue }));
            setMessage({ type: 'error', text: 'Failed to update setting' });
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
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={passwordData.new_password_confirmation}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
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
