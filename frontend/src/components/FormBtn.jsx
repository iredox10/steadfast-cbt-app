import React from "react";

const FormBtn = ({text}) => {
    return (
        <div>
            <button
                type="submit"
                className="bg-black px-4 py-2 text-white w-full text-lg capitalize "
            >
                {text}
            </button>
        </div>
    );
};

export default FormBtn;
