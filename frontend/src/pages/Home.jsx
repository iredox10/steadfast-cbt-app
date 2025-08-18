import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { path } from "../../utils/path";
import logo from "../../public/assets/logo.webp";
import { FaGraduationCap, FaSignInAlt, FaHeadset, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaHeart, FaUser, FaLock } from "react-icons/fa";

const Home = () => {
    const [candidateNumber, setCandidateNumber] = useState("");
    const [password, setPassword] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrMsg("");

        if (!candidateNumber || !password) {
            setErrMsg("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(`${path}/student-login`, {
                candidate_no: candidateNumber,
                password,
            });

            // Check if student is checked in
            if (res.data.checkin_time === null || res.data.checkin_time === undefined) {
                navigate("/not-check-in");
                setLoading(false);
                return;
            }

            // Check if student is already logged in/exam started
            if (res.data.is_logged_on === "yes") {
                navigate("/logged-student");
                setLoading(false);
                return;
            }
            
            // Student is checked in, proceed to exam instructions
            navigate(`/exam-instructions/${res.data.id}`);
        } catch (err) {
            // Handle different error types
            if (err.response?.status === 400 && err.response?.data === 'user not checked in') {
                navigate("/not-check-in");
            } else {
                setErrMsg(err.response?.data || "Login failed");
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <img
                            src={logo}
                            className="w-10 h-10 object-contain"
                            alt="HUK POLY Logo"
                        />
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">HUK POLY</h1>
                            <p className="text-xs text-gray-600">Computer Based Test Portal</p>
                        </div>
                    </div>
                    <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition flex items-center">
                        <FaHeadset className="mr-2" />
                        <span className="hidden sm:inline">Support</span>
                    </button>
                </div>
            </header>

            <main className="flex-grow flex items-center">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-md mx-auto">
                        {/* Login Card */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <FaGraduationCap className="text-white text-2xl" />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold text-white">Student Login</h1>
                                <p className="text-gray-300 mt-1">Access your examination portal</p>
                            </div>
                            
                            {/* Card Body */}
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {errMsg && (
                                        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                                            <div className="flex items-center">
                                                <i className="fas fa-exclamation-circle mr-2"></i>
                                                {errMsg}
                                            </div>
                                        </div>
                                    )}

                                    {/* Candidate Number */}
                                    <div>
                                        <label htmlFor="candidateNo" className="block text-gray-700 font-medium mb-2">
                                            Candidate Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaUser className="text-gray-400" />
                                            </div>
                                            <input
                                                id="candidateNo"
                                                type="text"
                                                name="candidateNo"
                                                placeholder="Enter your candidate number"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                                value={candidateNumber}
                                                onChange={(e) => {
                                                    setCandidateNumber(e.target.value);
                                                    setErrMsg("");
                                                }}
                                                disabled={loading}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
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
                                                name="password"
                                                placeholder="Enter your password"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    setErrMsg("");
                                                }}
                                                disabled={loading}
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
                                                Forgot?
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
                                                Login to Portal
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Help Text */}
                                <div className="mt-6 text-center">
                                    <p className="text-gray-600 text-sm">
                                        Don't have an account?{" "}
                                        <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                            Contact Administrator
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Features Section - Condensed */}
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                                    <FaLock className="text-blue-600" />
                                </div>
                                <h3 className="font-medium text-gray-800 text-sm">Secure</h3>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                                    <FaGraduationCap className="text-green-600" />
                                </div>
                                <h3 className="font-medium text-gray-800 text-sm">Reliable</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={logo}
                                    className="w-8 h-8 object-contain"
                                    alt="HUK POLY Logo"
                                />
                                <div>
                                    <h3 className="text-lg font-bold">HUK POLY</h3>
                                    <p className="text-gray-400 text-sm">Computer Based Test Portal</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <FaFacebookF />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <FaTwitter />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <FaInstagram />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <FaLinkedinIn />
                            </a>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
                        <p>
                            &copy; {new Date().getFullYear()} HUK Polytechnic. All rights reserved. | 
                            Designed with <FaHeart className="text-red-500 inline" /> for Education
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;