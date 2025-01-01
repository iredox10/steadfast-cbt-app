import React, { useEffect, useRef, useState } from "react";
import GridLayout from "../../components/GridLayout";
import Sidebar from "../../components/Sidebar";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import PlusBtn from "../../components/PlusBtn";
import Model from "../../components/Model";
import { FaTimes } from "react-icons/fa";
import { path } from "../../../utils/path";
import axios from "axios";
import FormBtn from "../../components/FormBtn";
import Header from "../../components/Header";
import ErrMsg from "../../components/ErrMsg";

const InstructorsCourses = () => {
    const { id } = useParams();
    const {
        data: user,
        loading: load,
        error: err,
    } = useFetch(`/get-user/${id}`);

    const {
        data: allCourses,
        loading: sLoading,
        error: sErr,
    } = useFetch(`/get-active-session`);

    console.log(allCourses)

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
    const [errMsg, setErrMsg] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrMsg('');
        if (!courseId) {
            setErrMsg('Please select a course');
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
            setErrMsg(err.response.data);
        }
    };
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                <Sidebar>
                    <Link to="/admin-instructors" className="flex items-center gap-2 p-4 hover:bg-gray-200">
                        Back to Instructors
                    </Link>
                </Sidebar>

                <div className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {user && user.full_name}'s Courses
                        </h1>
                        <p className="text-gray-600">Manage instructor's course assignments</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses && courses.map((course) => (
                            <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h2>
                                <p className="text-gray-600">
                                    <span className="font-medium">Course Code:</span> {course.code}
                                </p>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => setshowModel(true)}
                    >
                        <PlusBtn />
                    </button>
                </div>
            </div>

            {showModel && (
                <Model>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Assign New Course</h2>
                            <button
                                onClick={() => setshowModel(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <FaTimes className="text-gray-600" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {errMsg && (
                                <ErrMsg msg={errMsg} />
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Course
                                </label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    onChange={(e) => setCourseId(e.target.value)}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Choose a course</option>
                                    {allCourses && allCourses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <FormBtn text="Assign Course" />
                        </form>
                    </div>
                </Model>
            )}
        </div>
    );
};

export default InstructorsCourses;
