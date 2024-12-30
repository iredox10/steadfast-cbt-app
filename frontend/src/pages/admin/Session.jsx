import { Link, useParams, useSearchParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import GridLayout from "../../components/GridLayout";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import FormCloseBtn from "../../components/FormCloseBtn";
import FormInput from "../../components/FormInput";
import { useEffect, useState } from "react";
import FormBtn from "../../components/FormBtn";
import Model from "../../components/Model";
import PlusBtn from "../../components/PlusBtn";
import { path } from "../../../utils/path";
import ConfirmationModel from "../../components/ConfirmationModel";

const Session = () => {
    const { id } = useParams();
    const [semester, setSemester] = useState();
    const [semesters, setSemesters] = useState();
    const [error, setError] = useState();
    const [showActivateSemesterModel, setShowActivateSemesterModel] = useState(false)

    const {
        data: session,
        loading: load,
        error: err,
    } = useFetch(`/get-acd-session/${id}`);

    const [showModel, setShowModel] = useState(false);

    const fetch = async () => {
        try {
            const res = await axios(`${path}/get-semesters/${id}`);
            setSemesters(res.data);
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
        if (!semester) {
            setError("field can't be empty");
            return;
        }
        try {
            const res = await axios.post(`${path}/add-semester/${id}`, {
                semester,
                status: "inactive",
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


    const handleActivateSemester = async (semesterId) => {
        console.log(semesterId)
        try {
            const res = await axios.post(
                `${path}/activate-semester/${semesterId}`
            );
            if (res.status == 200) {
                fetch();
                setShowActivateSemesterModel(false);
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <GridLayout>
                <Sidebar>
                    <Link to={`/admin-dashboard/${id}`}>Dashboard</Link>
                </Sidebar>
                <div className="col-span-5 p-5 grid grid-cols-4 grid-rows-12 w-full ">
                    <div>
                        <h1 className="my-4 font-bold">
                            List of ({session && session.title}) semesters
                        </h1>

                        <div className="flex gap-5 w-full ">
                            {semesters &&
                                semesters.map((semester) => (
                                    <div
                                        key={semester._id}
                                        className="bg-white p-4 text-center capitalize"
                                    >
                                        <p>{semester.semester} semester</p>
                                        <p className="font-bold">
                                            <span>status: </span>
                                            {semester.status}
                                        </p>

                                        <div className="flex items-center gap-5">
                                            <Link
                                                className="bg-black text-white px-4 py-1"
                                                to={`/semester/${semester.id}`}
                                            >
                                                view
                                            </Link>
                                            {semester.status == "inactive" ? (
                                                <button
                                                    onClick={() => {
                                                        setShowActivateSemesterModel(
                                                            true
                                                        );
                                                        setSemester({
                                                            id: semester.id,
                                                            semester:
                                                                semester.semester,
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
                </div>
            </GridLayout>
            <PlusBtn onclick={() => setShowModel(true)} />
            {showModel && (
                <Model>
                    <form onSubmit={handleSubmit} className="p-4">
                        <div className="flex justify-between ">
                            <h1>Add New Semester</h1>
                            <FormCloseBtn onclick={() => setShowModel(false)} />
                        </div>
                        {error && <div> {error}</div>}
                        <FormInput
                            label={"semester"}
                            labelFor={"semester"}
                            type={"text"}
                            name={"semester"}
                            onchange={(e) => setSemester(e.target.value)}
                            placeholder={"Enter title..."}
                        />
                        <FormBtn text={"submit"} />
                    </form>
                </Model>
            )}

            {showActivateSemesterModel && (
                <ConfirmationModel
                    title={`Do You Want To Activate ${semester.semester} semester`}
                    onYes={() => handleActivateSemester(semester.id)}
                    onNo={() => setShowActivateSemesterModel(false)}
                />
            )}
        </div>
    );
};

export default Session;
