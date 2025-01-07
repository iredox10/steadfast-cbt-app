import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import GridLayout from "../../components/GridLayout";
import Sidebar from "../../components/Sidebar";
import PlusBtn from "../../components/PlusBtn";
import Model from "../../components/Model";
import FormInput from "../../components/FormInput";
import FormBtn from "../../components/FormBtn";
import axios from "axios";
import { path } from "../../../utils/path";
import FormCloseBtn from "../../components/FormCloseBtn";

const Semester = () => {
    const { id } = useParams();
    // const { data: semester, loading, error } = useFetch(`/get-semester/${id}`);

    const [showModel, setShowModel] = useState(false);
    const [code, setCode] = useState();
    const [title, setTitle] = useState();
    const [creditUnit, setCreditUnit] = useState();
    const [semester, setSemester] = useState();
    const [error, setError] = useState();
    const fetch = async () => {
        try {
            const res = await axios(`${path}/get-semester/${id}`);
            setSemester(res.data);
            console.log(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!code || !title || !creditUnit) {
            setError("field can't be empty");
            return;
        }
        try {
            const res = await axios.post(`${path}/add-course/${id}`, {
                code,
                title,
                credit_unit: creditUnit,
            });
            console.log(res);
            if (res.status == 201) {
                fetch();
                setShowModel(false);
            }
        } catch (err) {
            console.log(err);
            if (err.response?.data?.includes("courses_code_unique")) {
                setError(
                    `Course code "${code}" already exists. Please use a different code.`
                );
            } else if (err.response?.data?.includes("courses_title_unique")) {
                setError(`Course title "${title}" already exists. `);
            } else {
                setError(
                    "An error occurred while adding the course. Please try again."
                );
            }
        }
    };

    return (
        <div>
            <GridLayout>
                <Sidebar>
                    <Link to={`/admin-dashboard`}>Dashboard</Link>
                </Sidebar>
                <div className="col-span-5">
                    <h1 className="p-5">List of Courses</h1>
                    {semester?.courses.length <= 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                            <svg
                                className="w-16 h-16 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                ></path>
                            </svg>
                            <p className="text-xl font-medium">
                                No Courses Registered
                            </p>
                            <p className="mt-2">
                                Click the plus button below to add your first
                                course
                            </p>
                        </div>
                    ) : (
                        <div className="col-span-5 p-5 grid grid-cols-4 gap-4 grid-rows-12">
                            {semester && (
                                <table className="min-w-full bg-white shadow-sm rounded-lg col-span-4">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Course
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Code
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Credit Unit
                                            </th>
                                            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th> */}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {semester.courses.map((course) => (
                                            <tr key={course.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {course.title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {course.code}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {course.credit_unit}
                                                </td>
                                                {/* I don't think we need to be adding student to courses */}
                                                {/* <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link
                                                        to={`/add-student-to-course/${course.id}`}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                                    >
                                                        Add Student
                                                    </Link>
                                                </td> */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </GridLayout>
            <PlusBtn onclick={() => setShowModel(true)} />
            {showModel && (
                <Model>
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-lg p-6 max-w-md w-full"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                Add New Course
                            </h2>
                            <FormCloseBtn onclick={() => setShowModel(false)} />
                        </div>

                        {error && (
                            <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                                <div className="flex items-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="font-medium">{error}</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <FormInput
                                label="Course Title"
                                labelFor="title"
                                type="text"
                                name="title"
                                onchange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Introduction to Programming"
                            />

                            <FormInput
                                label="Course Code"
                                labelFor="code"
                                type="text"
                                name="code"
                                onchange={(e) => setCode(e.target.value)}
                                placeholder="e.g. CSC101"
                            />

                            <FormInput
                                label="Credit Units"
                                labelFor="creditUnit"
                                type="number"
                                name="creditUnit"
                                onchange={(e) => setCreditUnit(e.target.value)}
                                placeholder="e.g. 3"
                            />
                        </div>

                        <div className="mt-6">
                            <FormBtn text="Add Course" />
                        </div>
                    </form>
                </Model>
            )}
        </div>
    );
};

export default Semester;
