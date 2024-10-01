import React from "react";

const FormInput = ({label,labelFor,type,name,placeholder,onchange}) => {
    return (
        <div class="mb-3 ">
            <label for={labelFor} class="m-0 capitalize" >{label}</label>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                class="capitalize p-4 w-full bg-white"
                onChange={onchange}
            />
        </div>
    );
};

export default FormInput;
