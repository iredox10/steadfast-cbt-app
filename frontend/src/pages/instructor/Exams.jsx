import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import Sidebar from "../../components/Sidebar";
import GridLayout from "../../components/GridLayout";
import { FaTimes } from "react-icons/fa";
import FormBtn from "../../components/FormBtn";
import Btn from "../../components/Btn";
import FormInput from "../../components/FormInput";

const Exams = () => {
    const { userId, courseId } = useParams();
    const { data: exams, loading, err } = useFetch(`/get-exams/${userId}`);
    const [showModel, setshowModel] = useState(false);
    const {
        data: course,
        loading: courseLoading,
        err: courseErr,
    } = useFetch(`/get-course/${courseId}`);

    const [maxScore, setMaxScore] = useState("");
    const [instruction, setInstruction] = useState('')
    const [noOfQuestion, setnoOfQuestion] = useState()
    const [acutualQuestion, setAcutualQuestion] = useState()
    
    const [examType, setExamType] = useState()
    const handleSubmit = async (e) => {
        try {
            const res = await axios.post(
                `${path}/add-exam/${userId}/${exam.id}`
            );
            console.log(res.data)
        } catch (err) { 
            console.log(err)
        }
    };

    return (
        <GridLayout>
            <Sidebar />
            <div className="p-5 col-span-5">
                <div className="flex items-center justify-between my-5">
                    <h1 className="capitalize ">
                        <span className="font-bold">{course.title}</span> Exams
                    </h1>
                    <Btn
                        onclick={() => setshowModel(!showModel)}
                        text={"add Exam"}
                    />
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <table className="min-w-full border-collapse overflow-hidden rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 ">
                                <th className="py-3 px-4 text-left text-gray-600 font-bold rounded-tl-lg">
                                    S/N
                                </th>
                                <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                    Course Name
                                </th>
                                <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                    Number Of Questions
                                </th>
                                <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                    Actual Questions
                                </th>
                                <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                    Exam Duration
                                </th>
                                <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                    Exam Type
                                </th>
                                <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                    Submission Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams &&
                                exams.map((exam, index) => (
                                    <tr className="border-b">
                                        <td className="py-3 px-4 text-gray-700">
                                            {index + 1}
                                        </td>
                                        <Link
                                            to={`/exam-questions/${userId}/${exam.id}`}
                                        >
                                            <td className="py-3 px-4 text-gray-700">
                                                {course.title}
                                            </td>
                                        </Link>
                                        <td className="py-3 px-4 text-gray-700">
                                            {exam.no_of_questions}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {exam.actual_questions}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {exam.exam_duration}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {exam.exam_type}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {exam.submission_status}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {showModel && (
                <div className="absolute top-0 left-0 bg-black/40 w-full h-screen">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-primary-color absolute w-2/4 top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] ">
                            <div className="flex items-center justify-between p-4 font-bold">
                                <h1 className="">Add New Exam</h1>
                                <button onClick={() => setshowModel(false)}>
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="mb-3">
                                    <label
                                        for="examtype"
                                        class="m-0 capitalize"
                                    >
                                        Exam Type
                                    </label>
                                    <select
                                        className="w-full p-4"
                                        name="examtype"
                                        id=""
                                    >
                                        <option selected disabled>
                                            Select Exam
                                        </option>
                                        <option value="school">School</option>
                                        <option value="external">
                                            External
                                        </option>
                                    </select>
                                </div>
                                <FormInput
                                    type={"text"}
                                    label={"instruction"}
                                    labelFor={"instruction"}
                                    placeholder={"Instruction ..."}
                                />
                                <div className="flex items-center gap-4">
                                    <FormInput
                                        type={"number"}
                                        label={"max score"}
                                        labelFor={"max score"}
                                        placeholder={"enter max score"}
                                    />
                                    <FormInput
                                        type={"number"}
                                        label={"max score"}
                                        labelFor={"max score"}
                                        placeholder={"enter max score"}
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <FormInput
                                        type={"number"}
                                        label={"Number of questions"}
                                        labelFor={"Number of questions"}
                                        placeholder={"Number of questions"}
                                    />
                                    <FormInput
                                        type={"number"}
                                        label={"actual question"}
                                        labelFor={"actual question"}
                                        placeholder={"actual question"}
                                    />
                                </div>
                                <FormInput
                                    type={"text"}
                                    label={"duration"}
                                    labelFor={"duration"}
                                    placeholder={"duration"}
                                />
                            </div>
                        </div>
                    </form>{" "}
                </div>
            )}
        </GridLayout>
    );
};

export default Exams;
