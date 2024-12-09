import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import useFetch from "../hooks/useFetch";
import { path } from "../../utils/path";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Timer from "../components/Timer";
import { parseDuration } from "../../utils/parseDuration";
import Model from "../components/Model";
import { FaTimes, FaTimesCircle } from "react-icons/fa";

const Student = () => {
    const { studentId } = useParams();
    const { data } = useFetch(`/get-student-exam`);
    const [answers, setAnswers] = useState([]);
    console.log(data);

    const time = parseDuration(data && data.exam.exam_duration);

    const { data: student } = useFetch(`/get-student/${studentId}`);
    console.log(student)
    const [course, setCourse] = useState();

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios(
                    `${path}/get-course-exam-questions/${data.exam.course_id}`
                );
                setCourse(res.data);
            } catch (err) {}
        };
        fetch();
    }, [data]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(
                    `${path}/get-course/${data.exam.course_id}`
                );
                setCourse(res.data);
                console.log(res);
            } catch (err) {
                console.log(err);
            }
        };
        fetch();
    }, [data]);

    const [activeButton, setActiveButton] = useState(null); // State to track the active button
    const [clickedBtns, setClickedBtns] = useState([]);
    const [showModel, setShowModel] = useState(false);
    const [questionToShow, setQuestionToShow] = useState();
    const [questionIndexToShow, setQuestionIndexToShow] = useState(0);
    // const [selectedAnswer, setSelectedAnswer] = useState();
    const [studentAnswers, setStudentAnswers] = useState([]);

    const selectedAnswerRef = useRef();

    useEffect(() => {
        const set = () => {
            data && setQuestionToShow(data.questions[0]);
            // console.log(c);
        };
        set();
    }, [questionToShow]);

    const handleClick = (index) => {
        // setActiveButton(index); // Update the active button index on click
        if (index === 0) {
            setQuestionIndexToShow(0);
        } else {
            setQuestionIndexToShow((prev) => index);
        }
        // if (!clickedBtns.includes(index)) {
        //     setClickedBtns((prev) => [...prev, index]);
        // }
    };

    const [selectedOption, setSelectedOption] = useState();
    const [question, setQuestion] = useState();

    const handleAnswer = (option, questionId, question, answer) => {
        selectedAnswerRef.current = { questionId, question, answer };
        setQuestion(question);
        setSelectedOption(answer);
    };

    const getPlainText = (html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || "";
    };

    const handleNext = async (questionId, question) => {
        if (questionIndexToShow == data.questions.length - 1) {
            return;
        }
        setQuestionIndexToShow((prev) => prev + 1);
        setActiveButton(questionIndexToShow + 1);
        setClickedBtns((prev) => [...prev, activeButton]);
        if (selectedOption) {
            const res = await axios.post(
                `${path}/answer-question/${studentId}/${questionId}/${data.exam.course_id}`,
                {
                    selected_answer: getPlainText(selectedOption),
                    question: getPlainText(question),
                    course_id: data.exam.course_Id,
                }
            );
            console.log(res.data);
        } else {
            return;
        }
    };

    const handlePrev = () => {
        if (questionIndexToShow === 0) {
            return;
        } else {
            setQuestionIndexToShow((prev) => prev - 1);
        }
    };

    const getDivStyle = (option) =>
        selectedOption == option
            ? "bg-green-500 text-white"
            : "bg-primary-color text-black";

    const [sumbitModel, setSubmitModel] = useState();
    const [msg, setMsg] = useState();
    const [reminder, setReminder] = useState();
    const reminderRef = useRef();
    const navigate = useNavigate();

    const timeRemain = (data) => {
        // setReminder(data)
    };

    const handleSubmit = async () => {
        try {
            const res = await axios.post(
                `${path}/student-submit-exam/${course.id}/${studentId}`
            );
            navigate("/student-submission/" + studentId);
            console.log(res.data);
        } catch (err) {
            console.log(err);
        }
    };
    return (
        <div class="grid grid-cols-6 gap-4 min-h-screen">
            <Sidebar />
            <div class="col-start-2  col-end-7 ">
                <div class="divide-y-2  p-4">
                    <div class="flex items-center justify-between capitalize py-4">
                        <h1 class="font-bold">
                            {student && student.full_name}
                            <span class="block">{student.candidate_no}</span>
                        </h1>
                        <div>
                            <button
                                type="button"
                                class="bg-black text-white p-2 font-bold"
                            >
                                {data && (
                                    <Timer
                                        initialTime={time}
                                        onTimeUp={() => alert("times up")}
                                        reminder={timeRemain}
                                    />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <div class="">
                            <div class="my-4">
                                <div className=" justify-between text-sm">
                                    <h1 class="  capitalize">
                                        <span className="font-bold">
                                            course:{" "}
                                        </span>
                                        {course && course.title}
                                    </h1>
                                    <h1 class="  capitalize">
                                        <span className="font-bold">
                                            code:{" "}
                                        </span>
                                        {course && course.code}
                                    </h1>
                                </div>
                                <div className="flex justify-between w-full capitalize my-4">
                                    <p className="text-xl ">
                                        <span className="font-bold">
                                            Instruction:{" "}
                                        </span>
                                        {data && data.exam.instructions}
                                    </p>
                                    <p>
                                        <span className="font-bold">
                                            Date:{" "}
                                        </span>
                                        {new Date().toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div class="bg-white/60 p-4">
                                {data &&
                                    data.questions.map((question, index) => {
                                        if (index == questionIndexToShow) {
                                            return (
                                                <div>
                                                    <h3 class="font-poppins font-bold my-2">
                                                        <span>Question: </span>
                                                        {index + 1}
                                                    </h3>
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html: question.question,
                                                        }}
                                                    />
                                                    <div>
                                                        <div
                                                            onClick={() =>
                                                                handleAnswer(
                                                                    "correct_answer",
                                                                    question.id,
                                                                    question.question,
                                                                    question.correct_answer
                                                                )
                                                            }
                                                            class={`${getDivStyle(
                                                                question.correct_answer
                                                            )}} flex items-center gap-5 w-[35rem] hover:bg-gray-500/50 cursor-pointer my-4 p-2`}
                                                        >
                                                            <button
                                                                type="btn"
                                                                class="bg-primary-color px-2 rounded-full text-xl"
                                                                onClick={() => {}}
                                                            >
                                                                a
                                                            </button>
                                                            <div
                                                                dangerouslySetInnerHTML={{
                                                                    // __html: question.option_a,
                                                                    __html: question.correct_answer,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <div
                                                            onClick={() => {
                                                                handleAnswer(
                                                                    "option_b",
                                                                    question.id,
                                                                    question.question,
                                                                    question.option_b
                                                                );
                                                            }}
                                                            class={`${getDivStyle(
                                                                question.option_b
                                                            )}} flex items-center gap-5 w-[35rem] hover:bg-gray-500/50 cursor-pointer my-4 p-2`}
                                                        >
                                                            <button
                                                                type="btn"
                                                                class="bg-primary-color px-2 rounded-full text-xl"
                                                            >
                                                                b
                                                            </button>
                                                            <div
                                                                dangerouslySetInnerHTML={{
                                                                    __html: question.option_b,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <div
                                                            onClick={() =>
                                                                handleAnswer(
                                                                    "option_c",
                                                                    question.id,
                                                                    question.question,
                                                                    question.option_c
                                                                )
                                                            }
                                                            class={`${getDivStyle(
                                                                question.option_c
                                                            )}} flex items-center gap-5 w-[35rem] hover:bg-gray-500/50 cursor-pointer my-4 p-2`}
                                                        >
                                                            <button
                                                                type="btn"
                                                                class="bg-primary-color px-2 rounded-full text-xl"
                                                            >
                                                                c
                                                            </button>
                                                            <div
                                                                dangerouslySetInnerHTML={{
                                                                    __html: question.option_c,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <div
                                                            onClick={() =>
                                                                handleAnswer(
                                                                    "option_c",
                                                                    question.id,
                                                                    question.question,
                                                                    question.option_d
                                                                )
                                                            }
                                                            class={`${getDivStyle(
                                                                question.option_d
                                                            )}} flex items-center gap-5 w-[35rem] hover:bg-gray-500/50 cursor-pointer my-4 p-2`}
                                                        >
                                                            <button
                                                                type="btn"
                                                                class="bg-primary-color px-2 rounded-full text-xl"
                                                            >
                                                                d
                                                            </button>
                                                            <div
                                                                dangerouslySetInnerHTML={{
                                                                    __html: question.option_d,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <div class="flex justify-center my-5 gap-5">
                                                        <button
                                                            onClick={handlePrev}
                                                            class="capitalize bg-black text-white px-4 py-2"
                                                        >
                                                            previous
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleNext(
                                                                    question.id,
                                                                    question.question
                                                                )
                                                            }
                                                            class="capitalize bg-black text-white px-4 py-2"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-4 mr-4">
                    <div className="grid grid-cols-[repeat(20,1fr)] gap-5">
                        {data &&
                            data.questions.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleClick(index)} // Update state on button click
                                    className={`bg-primary-color rounded-full hover:bg-black hover:text-white
                        ${
                            activeButton === index
                                ? "text-white bg-black font-bold text-xl"
                                : ""
                        } ${clickedBtns.includes(index) ? "bg-red-500" : ""} `} // Conditionally change the class if active
                                >
                                    {index + 1}
                                </button>
                            ))}
                    </div>
                </div>
                <div class="my-3 flex justify-center">
                    <button
                        onClick={() => setSubmitModel(true)}
                        class="px-14 py-2 bg-black text-white"
                    >
                        Submit
                    </button>
                </div>
            </div>
            {showModel && <div className="absolute bg-black"></div>}
            {sumbitModel && (
                <Model>
                    <div className="bg-white text-center p-4 shadow-lg rounded-sm capitalize">
                        <div className="">
                            <h1 className="font-bold text-xl">
                                Are you sure you want to submit
                            </h1>
                            <div className="flex justify-center my-4 gap-3">
                                <button
                                    className="bg-black px-12 py-2 text-white"
                                    onClick={handleSubmit}
                                >
                                    Yes
                                </button>
                                <button
                                    className="bg-red-500 px-12 py-2 text-white"
                                    onClick={() => setSubmitModel(false)}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                </Model>
            )}
        </div>
    );
};

export default Student;
