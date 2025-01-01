import React, { useEffect, useState } from "react";
import { atom } from "jotai";

import Sidebar from "../../components/Sidebar";
import useFetch from "../../hooks/useFetch";
import { path } from "../../../utils/path";
import PlusBtn from "../../components/PlusBtn";
import Model from "../../components/Model";
import FormInput from "../../components/FormInput";
import axios from "axios";
import FormBtn from "../../components/FormBtn";
import { Link } from "react-router-dom";
import FormCloseBtn from "../../components/FormCloseBtn";
import ConfirmationModel from "../../components/ConfirmationModel";

const AcdSession = () => {
    // const { data: sessions, loading, error } = useFetch(`/get-acd-sessions`);
    const [showModel, setshowModel] = useState(false);
    const [showActivateSessionModel, setShowActivateSessionModel] =
        useState(false);

    const [title, setTitle] = useState();
    const [activate, setActivate] = useState(false);
    const [errMsg, setErrMsg] = useState();

    const [session, setSession] = useState();

    const [sessions, setSessions] = useState();

    const fetch = async () => {
        try {
            const res = await axios(`${path}/get-acd-sessions/`);
            setSessions(res.data);
        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        fetch();
    }, []);

    // console.log(sessions)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) {
            setErrMsg("title not set");
            return;
        }
        try {
            const res = await axios.post(`${path}/add-acd-session`, {
                title,
                status: activate ? "active" : "inactive",
            });
            if (res.status == 201) {
                fetch();
                setshowModel(false);
            }
            console.log(res);
        } catch (err) {
            console.log(err.response.data);
            setErrMsg(err.response.data);
        }
    };

    const handleActivateSession = async (sessionId) => {
        try {
            const res = await axios.post(
                `${path}/activate-acd-session/${sessionId}`
            );
            if (res.status == 200) {
                fetch();
                setShowActivateSessionModel(false);
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                <Sidebar>
                    <Link to={"/admin-dashboard"} className="flex items-center gap-2 p-4 hover:bg-gray-200">
                        Dashboard
                    </Link>
                </Sidebar>

                <div className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">Academic Sessions</h1>
                        <p className="text-gray-600">Manage academic sessions and their status</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sessions && sessions.map((session) => (
                            <div key={session._id} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">{session.title}</h2>
                                    <span className={`px-3 py-1 rounded-full text-sm ${
                                        session.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {session.status}
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <Link 
                                        to={`/session/${session.id}`}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                                    >
                                        View Details
                                    </Link>
                                    {session.status === "inactive" && (
                                        <button
                                            onClick={() => {
                                                setShowActivateSessionModel(true);
                                                setSession({
                                                    id: session.id,
                                                    session: session.title,
                                                });
                                            }}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Activate
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => setshowModel(!showModel)}
                    >
                        <PlusBtn />
                    </button>
                </div>
            </div>

            {showModel && (
                <Model>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Add Academic Session</h2>
                            <FormCloseBtn onclick={() => setshowModel(false)} />
                        </div>

                        <form onSubmit={handleSubmit}>
                            {errMsg && <div className="mb-4 text-red-600">{errMsg}</div>}
                            
                            <FormInput
                                label={"Session Title"}
                                labelFor={"title"}
                                type={"text"}
                                name={"title"}
                                placeholder={"e.g. 2023/2024"}
                                onchange={(e) => setTitle(e.target.value)}
                            />

                            <div className="mb-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4"
                                        onChange={(e) => setActivate(e.target.checked)}
                                    />
                                    <span>Activate this session</span>
                                </label>
                            </div>

                            <FormBtn text={"Create Session"} />
                        </form>
                    </div>
                </Model>
            )}

            {showActivateSessionModel && (
                <ConfirmationModel
                    title={`Activate ${session.session}?`}
                    onYes={() => handleActivateSession(session.id)}
                    onNo={() => setShowActivateSessionModel(false)}
                />
            )}
        </div>
    );
};

export default AcdSession;
