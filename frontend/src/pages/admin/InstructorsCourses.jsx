import React, { useEffect, useRef, useState } from "react";
import GridLayout from "../../components/GridLayout";
import Sidebar from "../../components/Sidebar";
import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import PlusBtn from "../../components/PlusBtn";
import Model from "../../components/Model";
import { FaTimes } from "react-icons/fa";
import { path } from "../../../utils/path";
import axios from "axios";
import FormBtn from "../../components/FormBtn";

const InstructorsCourses = () => {
    const { id } = useParams();
    const {
        data: user,
        loading: load,
        error: err,
    } = useFetch(`/get-user/${id}`);

    const {
        data: allCourses,
        loading: coursesLoading,
        error: coursesErr,
    } = useFetch(`/get-all-courses`);

    const [courses, setCourses] = useState();
    const fetch = async () => {
        try {
            const res = await axios(`${path}/get-lecturer-courses/${id}`);
            setCourses(res.data);
            console.log(res.data);
        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        fetch();
    }, []);

    const [showModel, setshowModel] = useState(false);
    const [course, setCourse] = useState();
    const [courseId, setCourseId] = useState();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!courseId) {
            return;
        }
        try {
            const res = await axios.post(
                `${path}/add-lecturer-course/${id}/${courseId}`
            );
            if (res.status == 201) {
                setshowModel(false);
                fetch();
            }
            console.log(res.data);
        } catch (err) {
            console.log(err);
        }
    };
    return (
        <div>
            <GridLayout>
                <Sidebar />
                <div className="w-full  col-span-5 grid grid-cols-4 grid-rows-5 gap-5 m-10  ">
                    {courses &&
                        courses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white p-4 capitalize"
                            >
                                <p>
                                    <span className="font-bold">Title: </span>
                                    {course.title}
                                </p>
                                <p>
                                    <span className="font-bold">code: </span>
                                    {course.code}
                                </p>
                            </div>
                        ))}
                </div>
                <PlusBtn onclick={() => setshowModel(true)} />
            </GridLayout>
            {showModel && (
                <Model>
                    <form onSubmit={handleSubmit} className="p-4">
                        <div className="flex justify-between items-center mb-5">
                            <h1 className="capitalize font-bold ">
                                Add New Course
                            </h1>
                            <button
                                onClick={() => setshowModel(false)}
                                className="bg-black p-1 rounded-full text-white"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="my-3">
                            <label htmlFor="course">Course</label>
                            <select
                                className="w-full p-2"
                                name="rol"
                                id="role"
                                // onChange={(e) => fetchCourse(e.target.value)}
                                onChange={(e) => setCourseId(e.target.value)}
                            >
                                <option selected disabled>
                                    Select Course
                                </option>
                                {allCourses &&
                                    allCourses.map((course) => (
                                        <option value={course.id}>
                                            {course.title}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <FormBtn text={"submit"} />
                    </form>
                </Model>
            )}
        </div>
    );
};

export default InstructorsCourses;
