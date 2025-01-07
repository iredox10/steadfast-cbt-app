import React from "react";
import Model from "./Model";

const ConfirmationModel = ({ title, onYes, onNo }) => {
    return (
        <Model>
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to proceed with this action?</p>
                <div className="flex justify-end gap-4">
                    <button
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        onClick={onNo}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        onClick={onYes}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </Model>
    );
};

export default ConfirmationModel;
