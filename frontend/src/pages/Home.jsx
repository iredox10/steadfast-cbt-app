import logo from "../../public/assets/logo.webp";
import exam_img from "../../public/assets/exam_img.png";
import FormInput from "../components/FormInput";
import axios from "axios";
import { path } from "../../utils/path";
import { useState } from "react";
import ErrMsg from "../components/ErrMsg";
const Home = () => {
    const [candidateNumber, setCandidateNumber] = useState('')
    const [password, setpassword] = useState('')
    const [errMsg, setErrMsg] = useState('')

    const handleSubmit = e =>{
        e.preventDefault()
        if(!candidateNumber || !password){
            setErrMsg('fields are empty')
            return
        }

        try {
        const res = axios.post(`${path}/student-login`) 
        console.log(res.data)
        } catch (err) {
           console.log(err) 
        }

    }
    return (
        <div>
            <div className="flex justify-center">
                <div className="flex flex-col items-center">
                    <img src={logo} className="w-[6rem]" alt="" />
                    <h1 className="font-bold">HUK POLY</h1>
                </div>
            </div>

            <div className="flex justify-between py-[4rem] px-16">
                <div>
                    <div>
                        <div className="py-2">
                            <h1 className="text-black font-bold  text-8xl">
                                Welcome
                            </h1>
                            <p className="text-black capitalize ml-4 text-xl ">
                                login to your account
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} method="POST">
                        {errMsg && <ErrMsg msg={errMsg} />}
                        <div className="flex flex-col my-4">
                            <FormInput
                                labelFor={"candidateNo"}
                                label={"Candidate Number"}
                                name={"candidateNo"}
                                placeholder={"Enter Your Candidate Number"}
                            />
                            
                            <FormInput
                                labelFor={"password"}
                                label={"password"}
                                name={"password"}
                                placeholder={"Enter Your Password "}
                            />
                            <button
                                type="submit"
                                className="bg-black px-4 py-2 text-white text-lg capitalize "
                            >
                                login
                            </button>
                        </div>
                    </form>
                </div>
                <div className="relative">
                    <div className="absolute -z-10 w-[18rem] h-[18rem] rounded-full bg-black/20"></div>
                    <div className="absolute top-[5rem] right-0 -z-10 w-[20rem] h-[20rem] rounded-full bg-black/40"></div>
                    <img src={exam_img} alt="className exam image" />
                </div>
            </div>

        </div>
    );
};

export default Home;
