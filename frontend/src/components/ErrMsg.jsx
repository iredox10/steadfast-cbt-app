import React from "react";
import { FaExclamationCircle } from "react-icons/fa";

const ErrMsg = ({ msg }) => {
    return (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded mb-4">
            <div className="flex items-center">
                <FaExclamationCircle className="mr-2" />
                <span className="block sm:inline capitalize">{msg}</span>
            </div>
        </div>
    );
};

export default ErrMsg;