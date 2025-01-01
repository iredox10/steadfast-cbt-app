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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S/N</th>
                                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Full Name</th>
                                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Candidate Number</th>
                                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Programme</th>
                                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">
                                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : scores && scores.map((score, index) => {
                                        const student = students?.find(s => s.id === score.student_id);
                                        return (
                                            <tr key={score.id} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="py-4 px-6 text-sm text-gray-600">{index + 1}</td>
                                                <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                                    {student?.full_name}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600">
                                                    {student?.candidate_no}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600">
                                                    {student?.programme}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600">
                                                    {student?.department}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {score.score}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </GridLayout>
        </div>
    );
};

export default InstructorStudents;
