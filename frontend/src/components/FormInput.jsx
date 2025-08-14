import React from "react";

const FormInput = ({ 
    label, 
    labelFor, 
    type = "text", 
    name, 
    placeholder, 
    onchange, 
    value, 
    disabled,
    icon,
    required
}) => {
    return (
        <div className="mb-5">
            {label && (
                <label htmlFor={labelFor} className="block text-gray-700 font-medium mb-2 capitalize">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    id={labelFor}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onchange}
                    disabled={disabled}
                    required={required}
                    className={`w-full ${icon ? 'pl-10' : 'px-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                />
            </div>
        </div>
    );
};

export default FormInput;