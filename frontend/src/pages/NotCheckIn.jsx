import React from "react";

const NotCheckIn = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Not Checked In</h1>
                    <p className="text-gray-600 text-lg">
                        You have not checked in to take this exam. Please check in with your instructor first.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotCheckIn;
