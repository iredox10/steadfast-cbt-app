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
            if(res.status == 200){
                fetch()
                setshowModel(false)
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <GridLayout>
                <Sidebar />
                <div className="col-span-5 m-5">
                    <Header
                        title={"Instructors"}
                        subtitle={"List of instructors"}
                    />
                    <div className="w-full  grid grid-cols-4 grid-rows-5 gap-5   ">
                        {instructors &&
                            instructors.map((instructor) => (
                                <div
                                    key={instructor.id}
                                    className="bg-white p-4 capitalize"
                                >
                                    <Link
                                        to={`/admin-instructor-courses/${instructor.id}`}
                                    >
                                        <p>
                                            <span className="font-bold ">
                                                fullname:{" "}
                                            </span>
                                            {instructor.full_name}
                                        </p>
                                        <p>
                                            <span className="font-bold ">
                                                Email:{" "}
                                            </span>
                                            {instructor.email}
                                        </p>
                                        <p>
                                            <span className="font-bold ">
                                                Role:{" "}
                                            </span>
                                            {instructor.role}
                                        </p>
                                    </Link>
                                </div>
                            ))}
                    </div>
                </div>
                <PlusBtn onclick={() => setshowModel(!showModel)} />
            </GridLayout>
            {showModel && (
                <Model>
                    <form onSubmit={handleSubmit} className="p-4">
                        <div className="flex justify-between items-center mb-5">
                            <h1 className="capitalize font-bold ">
                                Add New User
                            </h1>
                            <button
                                onClick={() => setshowModel(false)}
                                className="bg-black p-1 rounded-full text-white"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <FormInput
                            label={"fullname"}
                            labelFor={"fullname"}
                            name={"fullname"}
                            onchange={(e) => setFullname(e.target.value)}
                            placeholder={"Enter Fullname..."}
                        />
                        <FormInput
                            label={"email"}
                            labelFor={"email"}
                            name={"email"}
                            onchange={(e) => setEmail(e.target.value)}
                            placeholder={"Enter email..."}
                        />
                        <div>
                            <label htmlFor="role">Role</label>
                            <select
                                className="w-full p-2"
                                name="rol"
                                id="role"
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option selected disabled>
                                    Select Role
                                </option>
                                <option value="admin">admin</option>
                                <option value="regular">regular</option>
                                <option value="lecturer">lecturer</option>
                            </select>
                        </div>
                        <FormInput
                            label={"password"}
                            labelFor={"password"}
                            type={"password"}
                            name={"password"}
                            onchange={(e) => setPassword(e.target.value)}
                            placeholder={"Enter Password..."}
                        />
                        <FormBtn text={"submit"} />
                    </form>
                </Model>
            )}
        </div>
    );
};

export default AdminInstructiors;
