import React from "react";

const Btn = ({ text, onclick }) => {
    return (
        <div>
            <button onClick={onclick} className="bg-black px-4 py-2 text-white w-full text-lg capitalize ">
                {text}
            </button>
        </div>
    );
};

export default Btn;
