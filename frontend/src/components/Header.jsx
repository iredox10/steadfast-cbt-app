import React from "react";

const Header = ({title, subtitle}) => {
    return (
        <div className="bg-white shadow-sm p-6 mb-8 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1 capitalize">
                        {title}
                    </h1>
                    <p className="text-gray-600">
                        {subtitle}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <i className="fas fa-bell text-gray-600"></i>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <i className="fas fa-user text-blue-600"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;