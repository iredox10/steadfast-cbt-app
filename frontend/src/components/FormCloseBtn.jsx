import React from "react";
import { FaTimes } from "react-icons/fa";

const FormCloseBtn = ({onclick}) => {
    return (
        <button onClick={onclick} className="bg-black p-2 text-white rounded-full">
            <FaTimes />
        </button>
    );
};

export default FormCloseBtn;
