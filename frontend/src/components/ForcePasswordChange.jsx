import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { path } from '../../utils/path';

const ForcePasswordChange = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const forceChange = localStorage.getItem('force_password_change');
        if (forceChange === 'true') {
            setIsOpen(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr('');

        if (newPassword !== confirmPassword) {
            setErr("Passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setErr("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post(
                `${path}/change-password`,
                { 
                    current_password: currentPassword,
                    new_password: newPassword,
                    new_password_confirmation: confirmPassword 
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            
            localStorage.setItem('force_password_change', 'false');
            setSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
            }, 2000);
        } catch (error) {
            setErr(error.response?.data?.error || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Update Required</h2>
                
                {success ? (
                    <div className="text-green-600 bg-green-50 p-4 rounded mb-4">
                        Password updated successfully. You can now continue.
                    </div>
                ) : (
                    <>
                        <div className="text-red-600 bg-red-50 p-4 rounded mb-6 text-sm">
                            For security reasons, you must change your default password before proceeding.
                        </div>
                        
                        {err && (
                            <div className="text-red-500 text-sm mb-4">
                                {err}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForcePasswordChange;