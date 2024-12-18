import axios from "axios";
import logo from "../../../public/assets/logo.webp";
import FormBtn from "../../components/FormBtn";
import FormInput from "../../components/FormInput";
import { path } from "../../../utils/path";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

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
        <div className="flex gap-10 min-h-screen">
            <div className="bg-black flex-1 p-11">
                <div className="w-[20%] my-11">
                    <img src={logo} alt="logo" className="w-full" />
                </div>
                <div className="text-white ">
                    <h1 className="text-6xl font-black">
                        <span className="block ">Hassan</span>
                        <span className="block">Usman Katsina</span>
                        <span className="block">Polytechnic</span>
                    </h1>
                    <p className="my-4">Computer Based Test (CBT)</p>
                </div>
            </div>
            <div className="flex-1 p-32">
                <form onSubmit={handleSubmit}>
                    <h1 className="font-black text-xl my-4">Admin Login</h1>
                    {err && <p>{err}</p>}
                    <FormInput
                        label={"email"}
                        labelFor={"email"}
                        type={"text"}
                        placeholder={"enter your email"}
                        onchange={(e) => setEmail(e.target.value)}
                    />
                    <FormInput
                        label={"password"}
                        labelFor={"password"}
                        type={"password"}
                        placeholder={"enter your password"}
                        onchange={(e) => setPassword(e.target.value)}
                    />
                    <FormBtn text={"Login"} />
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
