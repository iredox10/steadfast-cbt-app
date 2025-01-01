import React from "react";

const Header = ({title,subtitle}) => {
    return (
        <div className="bg-white shadow-sm p-6 mb-8">
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900 mb-1 capitalize">
                    {title}
                </h1>
                <p className="text-gray-600">
                    {subtitle}
                </p>
            </div>
        </div>
    );
};

export default Header;
