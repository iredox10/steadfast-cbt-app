import React, { useState } from "react";
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

const AdminStudents = () => {
    const { id } = useParams();
    const { data: students, error, loading } = useFetch(`/get-students`);

    console.log(students);

    const [showModel, setShowModel] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [err, setErr] = useState();

    const [full_name, setFull_name] = useState("");
    const [candidate_no, setCandidate_no] = useState();
    const [department, setDepartment] = useState();
    const [programme, setProgramme] = useState();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!full_name || !candidate_no || !department || !programme) {
            setErr('fields can"t be empty');
            return;
        }
        try {
            const res = await axios.post(`${path}/register-student/${id}`, {
                full_name,
                candidate_no,
                department,
                programme,
                password: "password",
                is_logged_on: "no",
            });
            console.log(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <GridLayout>
            <Sidebar>
                <Link to={""}>Courses</Link>
            </Sidebar>
            <div className="p-4 w-full col-start-2 col-end-7">
                <div className="flex justify-between items-center">
                    <Header title={"Students"} subtitle={"List of students"} />
                    <Btn
                        text={"add student"}
                        onclick={() => setShowModel(true)}
                    />
                </div>
                <div className="bg-white w-full rounded-lg shadow-md p-4">
                    <table className="min-w-full border-collapse overflow-hidden rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 ">
                                <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tl-lg">
                                    fullname
                                </th>
                                <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tl-lg">
                                    Candidate Number
                                </th>
                                <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tl-lg">
                                    Department
                                </th>
                                <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tl-lg">
                                    Programme
                                </th>
                                <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tl-lg">
                                    is logged on
                                </th>
                                <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tl-lg">
                                    Checkin Time
                                </th>
                                <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tl-lg">
                                    Checkout Time
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {students &&
                                students.map((student) => (
                                    <tr>
                                        <td className="py-3 px-4 text-gray-700">
                                            {student.full_name}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {student.candidate_no}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {student.department}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {student.programme}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {student.is_logged_on}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {!student.checkin_time
                                                ? "null"
                                                : student.checkin_time}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {!student.checkout_time
                                                ? "null"
                                                : student.checkout_time}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {showModel && (
                <Model>
                    <div className="flex justify-end p-2">
                        <FormCloseBtn onclick={() => setShowModel(false)} />
                    </div>
                    <div className="flex w-full justify-center items-center gap-5 p-2">
                        <Btn
                            text={"add single student"}
                            onclick={() => {
                                setShowForm(true);
                                setShowImport(false);
                            }}
                        />
                        <Btn
                            text={"import students"}
                            onclick={() => {
                                setShowImport(true);
                                setShowForm(false);
                            }}
                        />
                    </div>
                    <div>
                        {showImport ? (
                            <div>
                                <input type="file" name="students" id="" />
                            </div>
                        ) : (
                            <div className="p-2">
                                <form onSubmit={handleSubmit}>
                                    <h1 className="capitalize font-bold text-center text-xl">
                                        add new student
                                    </h1>
                                    <div>
                                        <FormInput
                                            label={"full name"}
                                            labelFor={"fullname"}
                                            name={"fullname"}
                                            placeholder={"Enter full name.."}
                                            onchange={(e) =>
                                                setFull_name(e.target.value)
                                            }
                                        />
                                        <FormInput
                                            label={"candidate number"}
                                            labelFor={"candidate"}
                                            name={"candidate"}
                                            placeholder={"Enter Candidate"}
                                            onchange={(e) =>
                                                setCandidate_no(e.target.value)
                                            }
                                        />
                                        <FormInput
                                            label={"department"}
                                            labelFor={"department"}
                                            name={"department"}
                                            placeholder={"Enter Department.."}
                                            onchange={(e) =>
                                                setDepartment(e.target.value)
                                            }
                                        />
                                        <FormInput
                                            label={"programme"}
                                            labelFor={"programme"}
                                            name={"programme"}
                                            placeholder={"Enter programme.."}
                                            onchange={(e) =>
                                                setProgramme(e.target.value)
                                            }
                                        />
                                        <FormBtn text={"add student"} />
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </Model>
            )}
        </GridLayout>
    );
};

export default AdminStudents;
