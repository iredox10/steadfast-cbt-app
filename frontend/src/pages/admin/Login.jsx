import logo from "../../../public/assets/logo.webp";
import FormInput from "../../components/FormInput";
const AdminLogin = () => {
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
                <h1 className="font-black text-xl my-4">Admin Login</h1>
                <FormInput label={'email'} labelFor={'email'} type={'text'} placeholder={'enter your email'} />
                <FormInput label={'password'} labelFor={'password'} type={'password'} placeholder={'enter your password'} />
            </div>
        </div>
    );
};

export default AdminLogin;
