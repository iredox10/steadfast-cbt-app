import React from "react";
import { FaTimes } from "react-icons/fa";

const FormCloseBtn = ({onclick}) => {
    return (
        <button 
            onClick={onclick} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
            <FaTimes className="text-gray-600 hover:text-gray-800" />
        </button>
    );
};

export default FormCloseBtn;
