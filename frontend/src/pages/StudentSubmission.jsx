import React, { useEffect } from "react";
import FormBtn from "../components/FormBtn";
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";

const StudentSubmission = () => {
    const navigate = useNavigate();
    useEffect(() => {
        setTimeout(() => {
            navigate("/");
        }, 5000);
    }, []);
    return (
        <div class="grid place-content-center capitalize bg-white shadow-2xl my-32 mx-64 p-10">
            <div className="flex flex-col items-center gap-4">
                <div className="bg-green-600 text-white rounded-full h-10 w-10 grid place-content-center ">
                    <FaCheck className="text-3xl" />
                </div>
                <h1 className="font-bold text-4xl ">
                    exam submission successful
                </h1>
            </div>
        </div>
    );
};

export default StudentSubmission;
