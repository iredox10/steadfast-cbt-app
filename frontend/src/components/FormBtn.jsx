import React from "react";
import { Link } from "react-router-dom";

const FormBtn = ({ text, href }) => {
    return (
        <div>
            {href ? (
                <Link to={href}>{text}</Link>
            ) : (
                <button
                    type="submit"
                    className="bg-black px-4 py-2 text-white w-full text-lg capitalize "
                >
                    {text}
                </button>
            )}
        </div>
    );
};

// const FormBtn = ({ text, href }) => {
//     if (href) {
//         return <Link to={href}>{text}</Link>;
//     } else {
//         <button
//             type="submit"
//             className="bg-black px-4 py-2 text-white w-full text-lg capitalize "
//         >
//             {text}
//         </button>;
//     }
// };

export default FormBtn;
