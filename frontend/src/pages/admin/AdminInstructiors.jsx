import React, { useEffect, useState } from "react";
import GridLayout from "../../components/GridLayout";
import Sidebar from "../../components/Sidebar";
import useFetch from "../../hooks/useFetch";
import PlusBtn from "../../components/PlusBtn";
import Model from "../../components/Model";
import FormInput from "../../components/FormInput";
import { FaTimes } from "react-icons/fa";
import FormBtn from "../../components/FormBtn";
import HandleSubmit from "../../components/HandleSubmit";
import { path } from "../../../utils/path";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "../../components/Header";

const AdminInstructiors = () => {
    // const { data: instructors, loading, error } = useFetch(`/get-users`);
    const [instructors, setInstructors] = useState();
    const [showModel, setshowModel] = useState(false);
    const [fullname, setFullname] = useState();
    const [email, setEmail] = useState();
    const [role, setRole] = useState();
    const [password, setPassword] = useState();

    const fetch = async () => {
        try {
            const res = await axios(`${path}/get-users`);
            setInstructors(res.data);
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
        try {
            const res = await axios.post(`${path}/add-user`, {
                full_name: fullname,
                email,
                role,
                password,
                status: "active",
            });
            console.log(res.data);
            if (res.status == 200) {
                fetch();
                setshowModel(false);
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                <Sidebar>
                    <Link
                        to="/admin-dashboard"
                        className="flex items-center gap-2 p-4 hover:bg-gray-200"
                    >
                        Dashboard
                    </Link>
                </Sidebar>

                <div className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Instructors
                        </h1>
                        <p className="text-gray-600">
                            Manage instructors and their roles
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="col-span-5">
                            {!instructors ? (
                                <div className="flex justify-center items-center h-48">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : (
                                <table className="min-w-full bg-white shadow-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                FULL NAME
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                EMAIL
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ROLE
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {instructors.map((instructor) => (
                                            <tr
                                                key={instructor.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link
                                                        to={`/admin-instructor-courses/${instructor.id}`}
                                                        className="block"
                                                    >
                                                        <span className="font-semibold text-gray-800 capitalize">
                                                            {
                                                                instructor.full_name
                                                            }
                                                        </span>
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link
                                                        to={`/admin-instructor-courses/${instructor.id}`}
                                                        className="block"
                                                    >
                                                        <span className="text-gray-800 capitalize">
                                                            {instructor.email}
                                                        </span>
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link
                                                        to={`/admin-instructor-courses/${instructor.id}`}
                                                        className="block"
                                                    >
                                                        <span className="text-gray-800 capitalize">
                                                            {instructor.role}
                                                        </span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    <button onClick={() => setshowModel(!showModel)}>
                        <PlusBtn />
                    </button>
                </div>
            </div>

            {showModel && (
                <Model>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Add New User</h2>
                            <button
                                onClick={() => setshowModel(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <FaTimes className="text-gray-600" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <FormInput
                                label="Full Name"
                                labelFor="fullname"
                                name="fullname"
                                onchange={(e) => setFullname(e.target.value)}
                                placeholder="Enter full name..."
                            />

                            <FormInput
                                label="Email"
                                labelFor="email"
                                name="email"
                                type="email"
                                onchange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email address..."
                            />

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Role
                                </label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    onChange={(e) => setRole(e.target.value)}
                                    defaultValue=""
                                >
                                    <option value="" disabled>
                                        Select Role
                                    </option>
                                    <option value="admin">Admin</option>
                                    <option value="regular">Regular</option>
                                    <option value="lecturer">Lecturer</option>
                                </select>
                            </div>

                            <FormInput
                                label="Password"
                                labelFor="password"
                                type="password"
                                name="password"
                                onchange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password..."
                            />

                            <FormBtn text="Create User" />
                        </form>
                    </div>
                </Model>
            )}
        </div>
    );
};

export default AdminInstructiors;
