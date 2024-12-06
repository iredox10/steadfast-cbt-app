import React from "react";

const Header = ({title,subtitle}) => {
    return (
        <div className="py-4 capitalize">
            <h1 className="font-bold text-2xl">{title}</h1>
            <p>{subtitle}</p>
        </div>
    );
};

export default Header;
