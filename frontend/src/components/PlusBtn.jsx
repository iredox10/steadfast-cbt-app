import React from "react";
import { FaPlus } from "react-icons/fa";

const PlusBtn = ({onclick}) => {
    return (
        <div className="absolute bottom-9 right-9">
            <button className="bg-black text-white p-5 rounded-full" onClick={onclick}>
                <FaPlus />
            </button>
        </div>
    );
};

export default PlusBtn;
