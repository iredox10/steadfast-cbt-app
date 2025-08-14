import React from "react";
import { Link } from "react-router-dom";

const FormBtn = ({ text, href, style, disabled, loading, icon }) => {
    const baseClasses = "w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center disabled:opacity-50";
    
    if (href) {
        return (
            <Link
                className={`${baseClasses} ${style || ""}`}
                to={href}
            >
                {icon && <span className="mr-2">{icon}</span>}
                {text}
            </Link>
        );
    } else {
        return (
            <button
                type="submit"
                className={`${baseClasses} ${style || ""}`}
                disabled={disabled || loading}
            >
                {loading ? (
                    <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        {text}
                    </>
                ) : (
                    <>
                        {icon && <span className="mr-2">{icon}</span>}
                        {text}
                    </>
                )}
            </button>
        );
    }
};

export default FormBtn;