import React from "react";
import Sidebar from "../../components/Sidebar";
import { Link } from "react-router-dom";

const Instructor = () => {
    return (
        <div class="grid grid-cols-6 h-screen">
            <Sidebar>
                <Link
                    href="#"
                    class="text-start bg-secondary-color text-black rounded-l-3xl w-full p-3 "
                >
                    Course
                </Link>
                <Link href="#" class="p-3">
                    Questions
                </Link>
                <Link href="#" class="p-3">
                    Candidates
                </Link>
            </Sidebar>
            <div class="p-5  col-span-5 ">
                <div class="capitalize">
                    <h1>
                        Course by -{" "}
                        <span class="font-bold">Instructor name</span>
                    </h1>
                </div>
                <div class="grid grid-cols-4 gap-20 my-10 w-full ">
                    <div class="bg-white drop-shadow-lg flex justify-center p-12">
                        <Link to="/course-questions">Course One</Link>
                    </div>
                    <div class="bg-white drop-shadow-lg flex justify-center p-12">
                        <Link to="/course-questions">Course Two</Link>
                    </div>
                    <div class="bg-white drop-shadow-lg flex justify-center p-12">
                        <Link to="/course-questions">Course Three</Link>
                    </div>
                    <div class="bg-white drop-shadow-lg flex justify-center p-12">
                        <Link to="/course-questions">Course Four</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Instructor;
