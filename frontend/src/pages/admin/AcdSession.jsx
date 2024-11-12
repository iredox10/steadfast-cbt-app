import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import useFetch from "../../hooks/useFetch";
import { path } from "../../../utils/path";
import PlusBtn from "../../components/PlusBtn";
import Model from "../../components/Model";
import FormInput from "../../components/FormInput";
import axios from "axios";
import FormBtn from "../../components/FormBtn";

const AcdSession = () => {
    const { data: sessions, loading, error } = useFetch(`/get-acd-sessions`);
    const [showModel, setshowModel] = useState(false);
    const [title, setTitle] = useState();
    const [status, setStatus] = useState("unactive");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = axios.post(`/add-acd-session`, { title, status });
            console.log(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="grid grid-cols-6 gap-4 min-h-screen">
            <Sidebar />
            <div className="col-span-5 p-5 grid grid-cols-4 grid-rows-12">
                {sessions &&
                    sessions.map((session) => (
                        <div
                            key={session._id}
                            className="bg-white p-4 text-center capitalize"
                        >
                            <p>{session.title}</p>
                            <p className="font-bold">{session.status}</p>
                        </div>
                    ))}
            </div>
            <PlusBtn onclick={() => setshowModel(!showModel)} />
            {showModel && (
                <Model>
                    <div className="p-5 bg-primary-color capitalize">
                        <form onSubmit={handleSubmit}>
                            <h1 className="font-bold text-xl my-4">
                                Add ACD Session
                            </h1>
                            <FormInput
                                label={"Title"}
                                labelFor={"title"}
                                type={"text"}
                                name={"title"}
                                placeholder={"Enter Title"}
                                onchange={(e) => setTitle(e.target.value)}
                            />
                            <div>
                                <label htmlFor="status" className="block">
                                    status
                                </label>
                                <div className="flex gap-2">
                                    <p>activate</p>
                                    <input
                                        type="checkbox"
                                        name="status"
                                        id=""
                                        onChange={(e) => setStatus("active")}
                                    />
                                </div>
                                {/* <select name="status" id="" className="w-full">
                                    <option select disabled>select to activate</option>
                                    <option value="active">active</option>
                                </select> */}
                            </div>
                            <FormBtn text={"submit"} />
                        </form>
                    </div>
                </Model>
            )}
        </div>
    );
};

export default AcdSession;
