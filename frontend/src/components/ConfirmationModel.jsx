import React from "react";
import Model from "./Model";

const ConfirmationModel = ({ title, onYes, onNo }) => {
    return (
        <Model>
            <div className="p-4 text-center">
                <h1 className="text-2xl font-bold">{title}</h1>
                <div className="flex justify-center items-center gap-10">
                    <button
                        className="px-4 py-2 bg-green-500 text-white"
                        onClick={onYes}
                    >
                        Yes
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white"
                        onClick={onNo}
                    >
                        No
                    </button>
                </div>
            </div>
        </Model>
    );
};

export default ConfirmationModel;
