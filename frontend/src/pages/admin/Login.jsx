import axios from "axios";
import logo from "../../../public/assets/logo.webp";
import FormBtn from "../../components/FormBtn";
import FormInput from "../../components/FormInput";
import { path } from "../../../utils/path";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrMsg from "../../components/ErrMsg";
const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr('')
        if (!email || !password) {
            setErr("field can't be empty");
            return;
        }
        try {
            const res = await axios.post(`${path}/login`, { email, password });
            const user = res.data;
            if (user.role == "admin") {
                navigate(`/admin-dashboard/${user.id}`);
            } else if (user.role == "lecturer") {
                navigate(`/instructor/${res.data.id}`);
            }
        } catch (err) {
            console.log(err);
            setErr(err.response.data);
        }
    };
    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-black items-center justify-center p-12">
                <div className="max-w-xl">
                    <div className="mb-12">
                        <img src={logo} alt="HUK POLY Logo" className="w-32 h-32 object-contain" />
                    </div>
                    <div className="text-white space-y-4">
                        <h1 className="text-5xl font-bold leading-tight">
                            Hassan Usman Katsina Polytechnic
                        </h1>
                        <div className="h-1 w-20 bg-blue-500"></div>
                        <p className="text-xl text-gray-300">
                            Computer Based Test (CBT) Portal
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="text-gray-600 mt-2">Please sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {err && <ErrMsg msg={err} />}
                        
                        <FormInput
                            label="Email Address"
                            labelFor="email"
                            type="text"
                            placeholder="Enter your email"
                            onchange={(e) => setEmail(e.target.value)}
                        />

                        <FormInput
                            label="Password"
                            labelFor="password"
                            type="password"
                            placeholder="Enter your password"
                            onchange={(e) => setPassword(e.target.value)}
                        />

                        <FormBtn text="Sign In" />
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
