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
            console.log(res.data);
            if (res.status == 201) {
                fetch();
                setShowModel(false);
            }
        } catch (err) {
            console.log(err);
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
                    <div className="col-span-5 p-5 grid grid-cols-4 gap-4 grid-rows-12">
                        {semester && (
                            <table className="min-w-full bg-white shadow-sm rounded-lg col-span-4">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Unit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {semester.courses.map((course) => (
                                        <tr key={course.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{course.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{course.code}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{course.credit_unit}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link 
                                                    to={`/add-student-to-course/${course.id}`}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                                >
                                                    Add Student
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </GridLayout>
            <PlusBtn onclick={() => setShowModel(true)} />
            {showModel && (
                <Model>
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Add New Course</h2>
                            <FormCloseBtn onclick={() => setShowModel(false)} />
                        </div>

                        {error && (
                            <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-md">
                                {error}
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
