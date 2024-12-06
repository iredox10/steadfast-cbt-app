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
                        {semester &&
                            semester.courses.map((course) => {
                                return (
                                    <div
                                        key={course.id}
                                        className="bg-white p-2"
                                    >
                                        <p>
                                            <span className="font-bold">
                                                Course:{" "}
                                            </span>
                                            {course.title}
                                        </p>
                                        <p>
                                            <span className="font-bold">
                                                Code:{" "}
                                            </span>
                                            {course.code}
                                        </p>
                                        <p>
                                            <span className="font-bold">
                                                Credit Unit:{" "}
                                            </span>
                                            {course.credit_unit}
                                        </p>
                                        <FormBtn text={'add student'} href={`/add-student-to-course/${course.id}`} style={'block'}/>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </GridLayout>
            <PlusBtn onclick={() => setShowModel(true)} />
            {showModel && (
                <Model>
                    <form onSubmit={handleSubmit} className="p-4">
                        <div className="flex justify-between ">
                            <h1 className="font-bold">Add New Course</h1>
                            <FormCloseBtn onclick={() => setShowModel(false)} />
                        </div>
                        {error && <div> {error}</div>}
                        <FormInput
                            label={"title"}
                            labelFor={"title"}
                            type={"text"}
                            name={"title"}
                            onchange={(e) => setTitle(e.target.value)}
                            placeholder={"Enter title..."}
                        />
                        <FormInput
                            label={"code"}
                            labelFor={"code"}
                            type={"text"}
                            name={"code"}
                            onchange={(e) => setCode(e.target.value)}
                            placeholder={"Enter code..."}
                        />
                        <FormInput
                            label={"credit unit"}
                            labelFor={"credit unit"}
                            type={"text"}
                            name={"credit unit"}
                            onchange={(e) => setCreditUnit(e.target.value)}
                            placeholder={"Enter Credit Unit..."}
                        />
                        <FormBtn text={"submit"} />
                    </form>
                </Model>
            )}
        </div>
    );
};

export default Semester;
