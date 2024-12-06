import React from "react";
import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import GridLayout from "../../components/GridLayout";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

const CourseStudents = () => {
    const { id } = useParams();
    const { data: course, error, loading } = useFetch(`/get-course/${id}`);
    const {data:students, error:stdErr, loading:stdLoading} = useFetch(`/get-course-students/${course && course.id}`)
    console.log(course);
    console.log(students)
    return (
        <GridLayout>
            <Sidebar />
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
