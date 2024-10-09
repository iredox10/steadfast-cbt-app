import { FaEye, FaPenToSquare } from "react-icons/fa6";
import Sidebar from "../../components/Sidebar";
import Student from "../Student";
import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { path } from "../../../utils/path";
import axios from "axios";
import { useEffect, useState } from "react";

const AdminDashboard = () => {
    const { data: exams, loading, err } = useFetch(`/get-exams`);
    console.log(exams);
    const [course, setCourse] = useState();
    useEffect(() => {
        exams &&
            exams.map(async (exam) => {
                try {
                    const res = await axios(
                        `${path}/get-course/${exam.course_id}`
                    );
                    setCourse(res.data);
                    console.log(course);
                } catch (err) {
                    console.log(err);
                }
            });
    }, [exams]);

    return (
        <div className="grid grid-cols-6 gap-4 min-h-screen">
            <Sidebar>
                <Link to={"/admin-session"}>Sessions</Link>
                <Link to={"/admin-courses"}>Courses</Link>
                <Link to={"/admin-instructors"}>instructors</Link>
            </Sidebar>
            <div className="col-span-5 p-5">
                <div className="flex justify-between  w-full my-5">
                    <div>
                        <h1 className="text-2xl font-bold">Students</h1>
                        <p>student details</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white flex items-center gap-3 p-2 rounded-full">
                            <input
                                type="search"
                                name="search"
                                id="search"
                                className="w-full p-1 border-none outline-none px-5"
                                placeholder="Search...."
                            />
                            <button>
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                        <i className="fas fa-filter"></i>
                        <div className="flex gap-4 items-center">
                            {/* {{-- <img src="" alt="profile picture" className=""> --}} */}
                            <i className="fas fa-user text-2xl border-2 border-black p-2 rounded-full"></i>
                            <button className="transition ease-in-out delay-75 p-1 arrow relative hover:mt-2">
                                <i className="fas fa-arrow-down"></i>
                                <button
                                    id="logout"
                                    className="hidden absolute top-[5rem] -right-0 p-2  h-10 bg-white shadow-lg"
                                >
                                    logout
                                </button>
                            </button>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <table className="min-w-full border-collapse overflow-hidden rounded-lg">
                            <thead>
                                <tr className="bg-gray-100 ">
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tl-lg">
                                        Id
                                    </th>
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                        Course
                                    </th>
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                        Number Of Questions
                                    </th>
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                        Acutal Question
                                    </th>
                                    
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold">Max score</th>
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold">Marks Per Question</th>
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold">Exam Type</th>
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold">Exam Duration</th>
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold">Is Activated</th>
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tr-lg">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams &&
                                    exams.map((exam, index) => (
                                        <tr className="border-b">
                                            <td className="py-3 px-4 text-gray-700">
                                                {index + 1}
                                            </td>
                                            <td className="py-3 px-4 text-gray-700">
                                                {course &&
                                                course.id == exam.course_id
                                                    ? course.title
                                                    : ""}
                                            </td>
                                            <td className="py-3 px-4 text-gray-700">{exam.no_of_questions}</td>
                                            <td className="py-3 px-4 text-gray-700">{exam.actual_questions}</td>
                                            <td className="py-3 px-4 text-gray-700">{exam.max_score}</td>
                                            <td className="py-3 px-4 text-gray-700">{exam.marks_per_question}</td>
                                            <td className="py-3 px-4 text-gray-700">{exam.exam_type}</td>
                                            <td className="py-3 px-4 text-gray-700">{exam.exam_duration}</td>
                                            <td className="py-3 px-4 text-gray-700">{exam.activated}</td>
                                            <td className="py-3 px-4 text-gray-700">
                                                <button
                                                    id="show_detail"
                                                    className="p-2 "
                                                >
                                                    {" "}
                                                    <FaEye />
                                                </button>
                                                <button
                                                    id="show_detail"
                                                    className="p-2"
                                                >
                                                    {" "}
                                                    <FaPenToSquare />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                Showing 6-21 of 1000
                            </span>
                            <div className="flex space-x-1 text-gray-600">
                                <a
                                    href="#"
                                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    1
                                </a>
                                <a
                                    href="#"
                                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    2
                                </a>
                                <a
                                    href="#"
                                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    3
                                </a>
                                <a
                                    href="#"
                                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    4
                                </a>
                                <a
                                    href="#"
                                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    5
                                </a>
                                <a
                                    href="#"
                                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    6
                                </a>
                                <a
                                    href="#"
                                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    7
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
