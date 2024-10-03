import React from "react";

const GridLayout = ({ children }) => {
    return <div class="grid grid-cols-6 h-screen">{children}</div>;
};

export default GridLayout;
