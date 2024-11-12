import React from "react";
import GridLayout from "../../components/GridLayout";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import useFetch from "../../hooks/useFetch";
import { Link, useParams } from "react-router-dom";

const InstructorStudents = () => {
    const { userId, courseId } = useParams();
    const {
        data: students,
        loading,
        error,
    } = useFetch(`/get-students/${userId}/${courseId}`);
    console.log(students);
    return (
        <div>
            <GridLayout>
                <Sidebar></Sidebar>
                <div className="p-5">
                    <Header title={"Candidate"} subtitle={"List of Student"} />
                    <div>
                        <table className="min-w-full border-collapse overflow-hidden rounded-lg">
                            <thead>
                                <tr className="bg-gray-100 ">
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tl-lg">
                                        S/N
                                    </th>
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                        Full Name
                                    </th>
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                        Candidate NUmber
                                    </th>
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                        programme
                                    </th>
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                        department
                                    </th><th className="py-3 px-4 text-left text-gray-600 font-bold">
                                        Marks
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {students &&
                                    students.map((student, index) => (
                                        <tr className="border-b">
                                            <td className="py-3 px-4 text-gray-700">
                                                {index + 1}
                                            </td>
                                            <Link
                                                to={`/exam-questions/${userId}/${student.id}`}
                                            >
                                                <td className="py-3 px-4 text-gray-700">
                                                    {student.full_name}
                                                </td>
                                            </Link>
                                            <td className="py-3 px-4 text-gray-700">
                                                {student.candidate_number}
                                            </td>
                                            <td className="py-3 px-4 text-gray-700">
                                                {student.programme}
                                            </td>
                                            <td className="py-3 px-4 text-gray-700">
                                                {student.department}
                                            </td>
                                            
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </GridLayout>
        </div>
    );
};

export default InstructorStudents;
