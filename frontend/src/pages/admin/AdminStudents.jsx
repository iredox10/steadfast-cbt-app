import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../components/Sidebar";
import GridLayout from "../../components/GridLayout";
import Header from "../../components/Header";
import useFetch from "../../hooks/useFetch";
import FormBtn from "../../components/FormBtn";
import Btn from "../../components/Btn";
import Model from "../../components/Model";
import FormInput from "../../components/FormInput";
import { path } from "../../../utils/path";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import FormCloseBtn from "../../components/FormCloseBtn";
import ErrMsg from "../../components/ErrMsg";

const AdminStudents = () => {
    const { id } = useParams();
    // const { data: students, error, loading } = useFetch(`/get-students`);

    const [students, setStudents] = useState();

    const fetch = async () => {
        try {
            const res = await axios(`${path}/get-students`);
            setStudents(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    const [showModel, setShowModel] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [err, setErr] = useState();

    const [full_name, setFull_name] = useState("");
    const [candidate_no, setCandidate_no] = useState();
    const [department, setDepartment] = useState();
    const [programme, setProgramme] = useState();
    const [image, setImage] = useState();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr(null);

        // if (!full_name || !candidate_no || !department || !programme) {
        //     setErr("All fields are required");
        //     return;
        // }
        // if (!image) {
        //     setErr("Please select an image");
        //     return;
        // }

        // const formData = new FormData();
        // formData.append("image", image);
        // formData.append("full_name", full_name);
        // formData.append("candidate_no", candidate_no);
        // formData.append("password", "password");
        // formData.append("is_logged_on", "no");
        // formData.append("programme", programme);
        // formData.append("department", department);
        console.log(programme)
        try {
            const res = await axios.post(`${path}/register-student/${id}`, {
                full_name,
                candidate_no,
                password: "password",
                programme,
                department,
                is_logged_on: "no",
            });

            if (res.status === 201) {
                setFull_name("");
                setCandidate_no("");
                setDepartment("");
                setProgramme("");
                setImage(null);

                setShowModel(false);
                fetch();

                console.log("heelo");
            }
            console.log(res.data)
        } catch (err) {
            setErr(
                err.response?.data?.error ||
                    "An error occurred while registering student"
            );
            console.error(err);
        }
    };

    const [file, setFile] = useState(null);
    const fileRef = useRef();

    // Handle file selection
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        // fileRef.current = e.target.files[0];
        console.log(file);
    };

    const [excelFile, setExcelFile] = useState();

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a file to upload");
            return;
        }

        const xfile = fileRef.current;
        const files = xfile.files[0];
        const formData = new FormData();
        formData.append("excel_file", files); // Pass the actual file from state

        try {
            const res = await axios.post(
                `${path}/upload-excel`, // Ensure the backend route is correct
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (res.status == 201) {
                setShowForm(false);
                setShowModel(false);
                fetch();
            }
            console.log("File uploaded successfully:", res);
        } catch (error) {
            console.error(
                "Error uploading file:",
                error.res?.data || error.message
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                <Sidebar>
                    <Link to="/admin-courses" className="flex items-center gap-2 p-4 hover:bg-gray-200">
                        <i className="fas fa-book"></i>
                        <span>Courses</span>
                    </Link>
                </Sidebar>

                <div className="flex-1 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Students</h1>
                            <p className="text-gray-600">Manage and view student information</p>
                        </div>
                        <button
                            onClick={() => setShowModel(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <i className="fas fa-plus"></i>
                            Add Student
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programme</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out Time</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students && students.map((student, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.full_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.candidate_no}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.programme}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    student.is_logged_on === "yes" 
                                                    ? "bg-green-100 text-green-800" 
                                                    : "bg-red-100 text-red-800"
                                                }`}>
                                                    {student.is_logged_on === "yes" ? "Logged In" : "Logged Out"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {student.checkin_time || "Not checked in"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {student.checkout_time || "Not checked out"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {showModel && (
                <Model>
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full h-[600px] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Add Student</h2>
                            <button
                                onClick={() => setShowModel(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FormCloseBtn onclick={() => setShowModel(false)} />
                            </button>
                        </div>

                        <div className="flex justify-center gap-4 mb-6">
                            <button
                                onClick={() => {
                                    setShowForm(true);
                                    setShowImport(false);
                                }}
                                className={`px-4 py-2 rounded-lg ${
                                    showForm 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                Add Single Student
                            </button>
                            <button
                                onClick={() => {
                                    setShowImport(true);
                                    setShowForm(false);
                                }}
                                className={`px-4 py-2 rounded-lg ${
                                    showImport
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                Import Students
                            </button>
                        </div>

                        {showImport ? (
                            <form onSubmit={handleFileUpload} className="space-y-4">
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <i className="fas fa-cloud-upload-alt text-gray-500 text-3xl mb-2"></i>
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            name="excel_file"
                                            ref={fileRef}
                                            onChange={handleFileChange}
                                            accept=".xlsx, .xls"
                                        />
                                    </label>
                                </div>
                                {file && (
                                    <p className="text-sm text-gray-600">Selected file: {file.name}</p>
                                )}
                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Upload File
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 h-[500px] overflow-y-auto">
                                {err && (
                                    <ErrMsg msg={err} />
                                )}
                                
                                <FormInput
                                    label="Full Name"
                                    labelFor="fullname"
                                    name="fullname"
                                    placeholder="Enter full name..."
                                    onchange={(e) => setFull_name(e.target.value)}
                                />
                                <FormInput
                                    label="Candidate Number"
                                    labelFor="candidate"
                                    name="candidate"
                                    placeholder="Enter candidate number..."
                                    onchange={(e) => setCandidate_no(e.target.value)}
                                />
                                <div className="flex gap-4">
                                    <FormInput
                                        label="Department"
                                        labelFor="department"
                                        name="department"
                                        placeholder="Enter department..."
                                        onchange={(e) => setDepartment(e.target.value)}
                                    />
                                    <FormInput
                                        label="Programme"
                                        labelFor="programme"
                                        name="programme"
                                        placeholder="Enter programme..."
                                        onchange={(e) => setProgramme(e.target.value)}
                                    />
                                </div>
                                <FormInput
                                    label="Profile Image"
                                    type="file"
                                    labelFor="image"
                                    name="image"
                                    onchange={(e) => setImage(e.target.files[0])}
                                />
                                
                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Add Student
                                </button>
                            </form>
                        )}

                    </div>
                </Model>
            )}
        </div>
    );
};

export default AdminStudents;
