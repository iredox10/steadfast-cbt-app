import React, { useEffect, useState } from "react";
import GridLayout from "../../components/GridLayout";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import useFetch from "../../hooks/useFetch";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { path } from "../../../utils/path";

const InstructorStudents = () => {
    const { userId, courseId } = useParams();
    const {
        data: scores,
        loading,
        error,
    } = useFetch(`/get-students-score/${courseId}`);
    console.log(scores);

    const [students, setStudents] = useState();

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios(`${path}/get-students`);
                setStudents(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetch();
    }, []);

    return (
        <div>
            <GridLayout>
                <Sidebar></Sidebar>
                <div className="p-5 col-start-2 col-end-7">
                    <Header title={"Candidate"} subtitle={"List of Student"} />
                    <div className="bg-white rounded-lg shadow-md p-4">
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
                                    </th>
                                    <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                        Score
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {scores &&
                                    scores.map((score, index) => (
                                        <tr className="border-b">
                                            <td className="py-3 px-4 text-gray-700">
                                                {index + 1}
                                            </td>
                                            {/* <Link
                                                to={`/exam-questions/${userId}/${student.id}`}
                                            >
                                                <td className="py-3 px-4 text-gray-700">
                                                    {student.full_name}
                                                </td>
                                            </Link> */}
                                            <td className="py-3 px-4 text-gray-700">
                                                {students &&
                                                    students.map((student) => {
                                                        if (
                                                            student.id ===
                                                            score.student_id
                                                        ) {
                                                            return student.full_name;
                                                        }
                                                    })}
                                            </td>
                                            <td className="py-3 px-4 text-gray-700">
                                                {students &&
                                                    students.map((student) => {
                                                        if (
                                                            student.id ===
                                                            score.student_id
                                                        ) {
                                                            return student.candidate_no;
                                                        }
                                                    })}
                                            </td>
                                            <td className="py-3 px-4 text-gray-700">
                                                {students &&
                                                    students.map((student) => {
                                                        if (
                                                            student.id ===
                                                            score.student_id
                                                        ) {
                                                            return student.programme;
                                                        }
                                                    })}
                                            </td>

                                            <td className="py-3 px-4 text-gray-700">
                                                {students &&
                                                    students.map((student) => {
                                                        if (
                                                            student.id ===
                                                            score.student_id
                                                        ) {
                                                            return student.department;
                                                        }
                                                    })}
                                            </td>
                                            <td className="py-3 px-4 text-gray-700">
                                                {students &&
                                                    students.map((student) => {
                                                        if (
                                                            student.id ===
                                                            score.student_id
                                                        ) {
                                                            return score.score;
                                                        }
                                                    })}
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
