import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { path } from "../../../utils/path";
import logo from "../../../public/assets/buk.png";
import { FaEnvelope, FaLock, FaSignInAlt, FaUserShield, FaUniversity } from "react-icons/fa";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        if (!email || !password) {
            setErr("All fields are required");
            return;
        }
        try {
            setLoading(true);
            const res = await axios.post(`${path}/login`, { email, password });
            const user = res.data;
            
            // Store token if returned
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }
            
            // Role-based navigation
            if (user.role === "admin") {
                navigate(`/dashboard/${user.id}`);
            } else if (user.role === "super_admin") {
                navigate(`/admin-dashboard/${user.id}`);
            } else if (user.role === "level_admin") {
                navigate(`/admin-dashboard/${user.id}`);
            } else if (user.role === "lecturer") {
                navigate(`/instructor/${user.id}`);
            } else if (user.role === "invigilator") {
                navigate(`/invigilator/${user.id}`);
            } else {
                setErr("Unknown user role. Please contact administrator.");
            }
        } catch (err) {
            console.log(err);
            setErr(err.response?.data || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-black items-center justify-center p-12 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10 -translate-x-32 -translate-y-32"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-10 translate-x-32 translate-y-32"></div>

                <div className="relative z-10 max-w-xl text-center">
                    <div className="mb-12">
                        <div className="flex justify-center mb-6">
                            <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                                <img
                                    src={logo}
                                    alt="HUK POLY Logo"
                                    className="w-24 h-24 object-contain"
                                />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                            Bayero University Kano
                        </h1>
                        <div className="h-1 w-20 bg-blue-500 mx-auto mb-6"></div>
                        <p className="text-xl text-gray-300">
                            Computer Based Test (CBT) Portal
                        </p>
                    </div>

                    <div className="mt-12">
                        <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                            <FaUniversity className="text-blue-400 mr-3 text-xl" />
                            <span className="text-white font-medium">Admin Portal</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
                <div className="max-w-md w-full">
                    {/* Mobile Logo */}
                    <div className="flex justify-center lg:hidden mb-8">
                        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
                            <img
                                src={logo}
                                alt="HUK POLY Logo"
                                className="w-12 h-12 object-contain"
                            />
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <FaUserShield className="text-gray-600 text-2xl" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Admin Portal
                        </h2>
                        <p className="text-gray-600">
                            Secure access for administrators, lecturers, and invigilators
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {err && (
                            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                                <div className="flex items-center">
                                    <i className="fas fa-exclamation-circle mr-2"></i>
                                    {err}
                                </div>
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErr("");
                                    }}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErr("");
                                    }}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <FaSignInAlt className="mr-2" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-sm">
                            Having trouble accessing your account?{" "}
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                Contact Support
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
