import logo from "../../public/assets/logo.webp";
import exam_img from "../../public/assets/exam_img.png";
import FormInput from "../components/FormInput";
import axios from "axios";
import { path } from "../../utils/path";
import { useState } from "react";
import ErrMsg from "../components/ErrMsg";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [candidateNumber, setCandidateNumber] = useState("");
    const [password, setPassword] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrMsg("");

        if (!candidateNumber || !password) {
            setErrMsg("Please fill in all fields");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${path}/student-login`, {
                candidate_no: candidateNumber,
                password,
            });

            if (res.status === 200) {
                if (res.data.is_logged_on === "no") {
                    // navigate(`student/${res.data.id}`);
                    navigate(`/exam-instructions/${res.data.id}`);
                }
                if (res.data.checkin_time == null) {
                    alert("you're not checkin");
                    return
                } else {
                    navigate("/logged-student");
                }
            }
        } catch (err) {
            setErrMsg(err.response?.data || "Login failed");
            setLoading(false); // Allow retrying on error
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="py-8 text-center">
                <div className="flex flex-col items-center">
                    <img
                        src={logo}
                        className="w-24 h-24 object-contain"
                        alt="HUK POLY Logo"
                    />
                    <h1 className="text-2xl font-bold text-gray-800 mt-2">
                        HUK POLY
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    {/* Login Section */}
                    <div className="w-full lg:w-1/2 max-w-md">
                        <div className="mb-8">
                            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-lg text-gray-600">
                                Please sign in to your account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {errMsg && (
                                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                                    {errMsg}
                                </div>
                            )}

                            <FormInput
                                labelFor="candidateNo"
                                label="Candidate Number"
                                name="candidateNo"
                                placeholder="Enter your candidate number"
                                onchange={(e) => {
                                    setCandidateNumber(e.target.value);
                                    setErrMsg(""); // Clear error when user types
                                }}
                                value={candidateNumber}
                                className="w-full"
                                disabled={loading}
                            />

                            <FormInput
                                type="password"
                                labelFor="password"
                                label="Password"
                                name="password"
                                placeholder="Enter your password"
                                onchange={(e) => {
                                    setPassword(e.target.value);
                                    setErrMsg(""); // Clear error when user types
                                }}
                                value={password}
                                className="w-full"
                                disabled={loading}
                            />

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                                onClick={() => {
                                    setErrMsg(""); // Clear any previous errors
                                }}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Image Section */}
                    <div className="w-full lg:w-1/2 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-100 rounded-full opacity-50 blur-xl"></div>
                        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-purple-100 rounded-full opacity-50 blur-xl"></div>
                        <img
                            src={exam_img}
                            alt="Student studying"
                            className="relative z-10 max-w-lg mx-auto w-full h-auto"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
