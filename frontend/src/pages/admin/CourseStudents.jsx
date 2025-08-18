import React from "react";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import GridLayout from "../../components/GridLayout";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { FaClock, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";

const CourseStudents = () => {
    const { id } = useParams();
    const { data: course, error, loading } = useFetch(`/get-course/${id}`);
    const {data:students, error:stdErr, loading:stdLoading} = useFetch(`/get-course-students/${course && course.id}`)
    console.log(course);
    console.log(students)
    return (
        <GridLayout>
            <Sidebar>
                <Link
                    to={`/admin-dashboard/${id}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 hover:text-black rounded-lg transition-colors"
                >
                    <FaClock />
                    <span>Exams</span>
                </Link>
                <Link
                    to={"/admin-sessions"}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 hover:text-black rounded-lg transition-colors"
                >
                    <FaClock />
                    <span>Sessions</span>
                </Link>
                <Link
                    to={"/admin-instructors"}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 hover:text-black rounded-lg transition-colors"
                >
                    <FaChalkboardTeacher />
                    <span>Instructors</span>
                </Link>
                <Link
                    to={`/admin-students/${id}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 hover:text-black rounded-lg transition-colors"
                >
                    <FaUserGraduate />
                    <span>Students</span>
                </Link>
            </Sidebar>
            <div className="col-start-2 col-end-7 p-5">
                <Header
                    title={course && `${course.title} Students`}
                    subtitle={course && `list of ${course.title} students`}
                />
                <table className="min-w-full border-collapse overflow-hidden rounded-lg">
                    <thead>
                        <tr className="bg-gray-100 ">
                            <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tl-lg">
                                Id
                            </th>
                            <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tl-lg">
                                Id
                            </th>
                            <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tl-lg">
                                Id
                            </th>
                        </tr>
                    </thead>
                </table>
            </div>
        </GridLayout>
    );
};

export default CourseStudents;
