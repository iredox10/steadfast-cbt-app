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
        <div className="grid grid-cols-6 gap-4 min-h-screen">
            <Sidebar>
                <Link to={"/admin-dashboard"}>Dashboard</Link>
            </Sidebar>

            <div className="col-span-5 p-5 grid grid-cols-4 grid-rows-12">
                <div className="w-full  col-span-4">
                    <h1 className="my-4 font-bold">Academy Sessions List</h1>
                    <div className="flex gap-5 w-full">
                        {sessions &&
                            sessions.map((session) => (
                                <div
                                    key={session._id}
                                    className="bg-white p-4 text-center capitalize"
                                >
                                    <p>{session.title}</p>
                                    <p className="font-bold">
                                        <span>status: </span>
                                        {session.status}
                                    </p>

                                    <div className="flex items-center gap-5">
                                        <Link
                                            className="bg-black text-white px-4 py-1"
                                            to={`/session/${session.id}`}
                                        >
                                            view
                                        </Link>
                                        {session.status == "inactive" ? (
                                            <button
                                                onClick={() => {
                                                    setShowActivateSessionModel(
                                                        true
                                                    );
                                                    setSession({
                                                        id: session.id,
                                                        session: session.title,
                                                    });
                                                }}
                                                className="bg-green-500 text-white px-4 py-1 capitalize"
                                            >
                                                activate
                                            </button>
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
                <PlusBtn onclick={() => setshowModel(!showModel)} />
                {showModel && (
                    <Model>
                        <div className="p-5 bg-primary-color capitalize">
                            <FormCloseBtn onclick={() => setshowModel(false)} />
                            <form onSubmit={handleSubmit}>
                                {errMsg && errMsg}
                                <h1 className="font-bold text-xl my-4">
                                    Add Academic Session
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
                                            onChange={(e) =>
                                                setActivate(e.target.checked)
                                            }
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
            {showActivateSessionModel && (
                <ConfirmationModel
                    title={`Do You Want To Activate ${session.session}`}
                    onYes={() => handleActivateSession(session.id)}
                    onNo={() => setShowActivateSessionModel(false)}
                />
            )}
        </div>
    );
};

export default AcdSession;
