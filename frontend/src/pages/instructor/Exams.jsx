import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import Sidebar from "../../components/Sidebar";
import GridLayout from "../../components/GridLayout";
import { FaCheck, FaTimes } from "react-icons/fa";
import FormBtn from "../../components/FormBtn";
import Btn from "../../components/Btn";
import FormInput from "../../components/FormInput";
import axios from "axios";
import { path } from "../../../utils/path";
import Model from "../../components/Model";

const Exams = () => {
    const { userId, courseId } = useParams();
    // const { data, loading, err } = useFetch(`/get-exams/${userId}`);

    const [showModel, setshowModel] = useState(false);
    const [showDeleteModel, setShowDeleteModel] = useState(false);
    const [showSubmitModel, setShowSubmitModel] = useState(false);

    const {
        data: course,
        loading: courseLoading,
        err: courseErr,
    } = useFetch(`/get-course/${courseId}`);
    console.log(course)

    const [maxScore, setMaxScore] = useState("");
    const [instructions, setInstructions] = useState("");
    const [noOfQuestions, setNoOfQuestions] = useState();
    const [acutualQuestions, setAcutualQuestions] = useState();
    const [examType, setExamType] = useState();
    const [exmaDuration, setExmaDuration] = useState();
    const [marksPerQuestion, setMarkPerQuestion] = useState();

    const [exams, setExams] = useState();
    const [exam, setExam] = useState();
    const fetch = async () => {
        try {
            const res = await axios(`${path}/get-exams/${userId}/${courseId}`);
            setExams(res.data);
            console.log(exams);
        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        fetch();
    }, [exam]);

    // useEffect(() => {
    //     fetch();
    // }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                `${path}/add-exam/${userId}/${courseId}`,
                {
                    instructions,
                    max_score: maxScore,
                    no_of_questions: noOfQuestions,
                    actual_questions: acutualQuestions,
                    exam_type: examType,
                    exam_duration: exmaDuration,
                    marks_per_question: marksPerQuestion,
                }
            );
            if (res.status == 201) {
                setshowModel(false);
            }
            console.log(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleShowSubmitModel = async (examId) => {
        setShowSubmitModel(true);
        try {
            const res = await axios(`${path}/get-exam-by-id/${examId}`);
            setExam(res.data);
            console.log(exam.id);
        } catch (error) {
            console.log(error);
        }
    };
    const handleSubmitExam = async () => {
        try {
            const res = await axios.post(`${path}/submit-exam/${exam.id}`);
            console.log(res.data);
            setShowSubmitModel(false);
            fetch();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <GridLayout>
            <Sidebar>
                <div>
                    <Link to={`/instructor-student/${userId}/${courseId}`}>
                        Candidate
                    </Link>
                </div>
            </Sidebar>
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
                                <th className="py-3 px-4 text-left text-gray-600 font-bold">
                                    actions
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
                                            {exam.submission_status ==
                                            "submitted" ? (
                                                <button className="p-1 bg-green-700 rounded-full">
                                                    <FaCheck className="text-white" />
                                                </button>
                                            ) : (
                                                <button className="p-1 bg-red-500 rounded-full">
                                                    <FaTimes className="text-white" />
                                                </button>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            <div className="flex gap-3 items-center">
                                                <button
                                                    className=""
                                                    onClick={() =>
                                                        handleShowSubmitModel(
                                                            exam.id
                                                        )
                                                    }
                                                >
                                                    submit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setShowDeleteModel(true)
                                                    }
                                                >
                                                    delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showSubmitModel && (
                <Model>
                    <div className="p-4 text-center">
                        <h1 className="text-2xl font-bold">
                            Did you want to submit{" "}
                        </h1>
                        <div className="flex justify-center items-center gap-10">
                            <button onClick={handleSubmitExam}>Yes</button>
                            <button onClick={() => setShowSubmitModel(false)}>
                                No
                            </button>
                        </div>
                    </div>
                </Model>
            )}

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
                                        onChange={(e) =>
                                            setExamType(e.target.value)
                                        }
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
                                    label={"instructions"}
                                    labelFor={"instructions"}
                                    placeholder={"Instructions ..."}
                                    onchange={(e) =>
                                        setInstructions(e.target.value)
                                    }
                                />
                                <div className="flex items-center gap-4">
                                    <FormInput
                                        type={"number"}
                                        label={"max score"}
                                        labelFor={"max score"}
                                        placeholder={"enter max score"}
                                        onchange={(e) =>
                                            setMaxScore(e.target.value)
                                        }
                                    />
                                    <FormInput
                                        type={"text"}
                                        label={"exam duration"}
                                        labelFor={"exam duration"}
                                        placeholder={"enter exam duration"}
                                        onchange={(e) =>
                                            setExmaDuration(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <FormInput
                                        type={"number"}
                                        label={"Number of questions"}
                                        labelFor={"Number of questions"}
                                        placeholder={"Number of questions"}
                                        onchange={(e) =>
                                            setNoOfQuestions(e.target.value)
                                        }
                                    />
                                    <FormInput
                                        type={"number"}
                                        label={"actual question"}
                                        labelFor={"actual question"}
                                        placeholder={"actual question"}
                                        onchange={(e) =>
                                            setAcutualQuestions(e.target.value)
                                        }
                                    />
                                </div>
                                <FormInput
                                    type={"number"}
                                    label={"mark per question"}
                                    labelFor={"mark per question"}
                                    placeholder={"enter mark per question"}
                                    onchange={(e) =>
                                        setMarkPerQuestion(e.target.value)
                                    }
                                />
                                <FormBtn text={"add exam"} />
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </GridLayout>
    );
};

export default Exams;
