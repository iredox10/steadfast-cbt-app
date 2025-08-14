import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { path } from "../../utils/path";
import logo from "../../public/assets/logo.webp";
import exam_img from "../../public/assets/exam_img.png";
import { FaGraduationCap, FaShieldAlt, FaBolt, FaChartLine, FaMobileAlt, FaCheck, FaSignInAlt, FaHeadset, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaHeart } from "react-icons/fa";

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

            if (res.data.checkin_time === null) {
                navigate("/not-check-in");
                setLoading(false);
                return;
            }

            if (res.data.is_logged_on === "yes") {
                navigate("/logged-student");
                setLoading(false);
                return;
            }
            navigate(`/exam-instructions/${res.data.id}`);
        } catch (err) {
            setErrMsg(err.response?.data || "Login failed");
            setLoading(false);
        }
    };

    const features = [
        {
            icon: <FaShieldAlt className="text-blue-600 text-xl" />,
            title: "Secure Testing",
            description: "Advanced proctoring and security measures to ensure exam integrity."
        },
        {
            icon: <FaBolt className="text-green-600 text-xl" />,
            title: "Instant Results",
            description: "Get real-time feedback and results immediately after submission."
        },
        {
            icon: <FaMobileAlt className="text-purple-600 text-xl" />,
            title: "Any Device Access",
            description: "Take exams on any device with our responsive platform."
        },
        {
            icon: <FaChartLine className="text-yellow-600 text-xl" />,
            title: "Performance Analytics",
            description: "Detailed analytics to track progress and identify improvement areas."
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <img
                            src={logo}
                            className="w-12 h-12 object-contain"
                            alt="HUK POLY Logo"
                        />
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">HUK POLY</h1>
                            <p className="text-xs text-gray-600">Computer Based Test Portal</p>
                        </div>
                    </div>
                    <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition flex items-center">
                        <FaHeadset className="mr-2" />
                        Support
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <section className="mb-16">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20 translate-x-32 -translate-y-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20 -translate-x-32 translate-y-32"></div>
                        
                        <div className="relative z-10 max-w-3xl">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">
                                Transforming Education Through <span className="text-blue-300">Digital Examinations</span>
                            </h1>
                            <p className="text-lg mb-8 text-gray-200">
                                Experience seamless, secure, and efficient computer-based testing at HUK POLY. 
                                Access your exams anytime, anywhere with our state-of-the-art platform.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center">
                                    <FaGraduationCap className="mr-2" />
                                    Student Login
                                </button>
                                <button className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                                    <FaGraduationCap className="mr-2" />
                                    Lecturer Portal
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Our CBT Platform?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our cutting-edge platform offers a seamless examination experience with advanced features 
                            for students, lecturers, and administrators.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Login and Info Section */}
                <section className="flex flex-col lg:flex-row gap-12 items-center mb-16">
                    {/* Info Section */}
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Your Account</h2>
                        <p className="text-gray-600 mb-8">
                            Login to your student, lecturer, or administrator account to access your dashboard and manage exams.
                        </p>
                        
                        <div className="space-y-6">
                            {[
                                { 
                                    title: "For Students", 
                                    description: "Access your scheduled exams, view results, and track your academic progress.",
                                    color: "blue"
                                },
                                { 
                                    title: "For Lecturers", 
                                    description: "Create exams, manage question banks, and analyze student performance.",
                                    color: "green"
                                },
                                { 
                                    title: "For Administrators", 
                                    description: "Manage users, oversee exams, and configure system settings.",
                                    color: "purple"
                                }
                            ].map((item, index) => (
                                <div key={index} className="flex items-start">
                                    <div className={`flex-shrink-0 mt-1 w-6 h-6 rounded-full bg-${item.color}-500 flex items-center justify-center`}>
                                        <FaCheck className="text-white text-xs" />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-800">{item.title}</h3>
                                        <p className="text-gray-600">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Login Form */}
                    <div className="flex-1 w-full max-w-md">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="text-center mb-8">
                                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 animate-bounce">
                                    <FaGraduationCap className="text-gray-600 text-2xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Student Login</h2>
                                <p className="text-gray-600">Enter your credentials to access your account</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {errMsg && (
                                    <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                                        <div className="flex items-center">
                                            <i className="fas fa-exclamation-circle mr-2"></i>
                                            {errMsg}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="candidateNo" className="block text-gray-700 font-medium mb-2">
                                        Candidate Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <i className="fas fa-id-card text-gray-400"></i>
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
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <i className="fas fa-lock text-gray-400"></i>
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
                                            Login to Dashboard
                                        </>
                                    )}
                                </button>
                            </form>

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
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-6 md:mb-0">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={logo}
                                    className="w-10 h-10 object-contain"
                                    alt="HUK POLY Logo"
                                />
                                <div>
                                    <h3 className="text-lg font-bold">HUK POLY</h3>
                                    <p className="text-gray-400 text-sm">Computer Based Test Portal</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-6">
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
                    <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
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