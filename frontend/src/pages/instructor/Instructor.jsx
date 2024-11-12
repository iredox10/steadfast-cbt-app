import React, { useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";

const Instructor = () => {
    const { id } = useParams();
    const { data: courses, loading, err } = useFetch(`/get-lecturer-courses/5`);
    const {
        data: user,
        loading: userLoading,
        err: userErr,
    } = useFetch(`/get-user/${id}`);

    console.log(user);
    console.log(courses);
    return (
        <div class="grid grid-cols-6 h-screen">
            <Sidebar>
                <Link
                    to="#"
                    class="text-start bg-secondary-color text-black rounded-l-3xl w-full p-3 "
                >
                    Course
                </Link>
                
                
            </Sidebar>
            <div class="p-5  col-span-5 ">
                <div class="capitalize">
                    <h1>
                        Course by -{" "}
                        <span class="font-bold">{user.full_name}</span>
                    </h1>
                </div>
                <div class="grid grid-cols-4 gap-20 my-10 w-full ">
                    {courses &&
                        courses.map((course) => (
                            <div>
                                <div class="bg-white drop-shadow-lg flex justify-center p-12">
                                    <Link to={`/exams/${course.user_id}/${course.course_id}`}>{course.title}</Link>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default Instructor;
