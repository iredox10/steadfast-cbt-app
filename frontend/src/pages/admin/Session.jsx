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
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                <Sidebar>
                    <Link to={`/admin-dashboard/${id}`} className="flex items-center gap-2 p-4 hover:bg-gray-200">
                        Dashboard
                    </Link>
                </Sidebar>

                <div className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {session && session.title} - Semesters
                        </h1>
                        <p className="text-gray-600">Manage semesters and their status</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {semesters && semesters.map((semester) => (
                            <div key={semester._id} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800 capitalize">
                                        {semester.semester} Semester
                                    </h2>
                                    <span className={`px-3 py-1 rounded-full text-sm ${
                                        semester.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {semester.status}
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <Link 
                                        to={`/semester/${semester.id}`}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                                    >
                                        View Details
                                    </Link>
                                    {semester.status === "inactive" && (
                                        <button
                                            onClick={() => {
                                                setShowActivateSemesterModel(true);
                                                setSemester({
                                                    id: semester.id,
                                                    semester: semester.semester,
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
                        onClick={() => setShowModel(true)}
                    >
                        <PlusBtn />
                    </button>
                </div>
            </div>

            {showModel && (
                <Model>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Add New Semester</h2>
                            <FormCloseBtn onclick={() => setShowModel(false)} />
                        </div>

                        <form onSubmit={handleSubmit}>
                            {error && <div className="mb-4 text-red-600">{error}</div>}
                            
                            <FormInput
                                label={"Semester"}
                                labelFor={"semester"}
                                type={"text"}
                                name={"semester"}
                                placeholder={"Enter semester title..."}
                                onchange={(e) => setSemester(e.target.value)}
                            />

                            <FormBtn text={"Create Semester"} />
                        </form>
                    </div>
                </Model>
            )}

            {showActivateSemesterModel && (
                <ConfirmationModel
                    title={`Activate ${semester.semester} semester?`}
                    onYes={() => handleActivateSemester(semester.id)}
                    onNo={() => setShowActivateSemesterModel(false)}
                />
            )}
        </div>
    );
};

export default Session;
