import React from "react";
import { useParams } from "react-router-dom";

const InstructorTest = () => {
    const { id } = useParams();
    
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-2xl font-bold">Instructor Test Page</h1>
            <p>User ID: {id}</p>
            <p>If you see this, basic routing is working.</p>
        </div>
    );
};

export default InstructorTest;
