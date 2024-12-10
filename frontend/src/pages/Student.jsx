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
    // console.log(data && data.exam.exam_duration);

    // const time = parseDuration(data && data.exam.exam_duration);

    const { data: student } = useFetch(`/get-student/${studentId}`);
    // console.log(student);
    const [course, setCourse] = useState();

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

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
            setClickedBtns(prev => [...prev, 0])
            // console.log(c);
        };
        set();
    }, [questionToShow]);

    const handleClick = (index) => {
        setActiveButton(index); // Update the active button index on click
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
        if (questionIndexToShow === data.questions.length - 1) {
            setClickedBtns((prev) => [...prev, questionIndexToShow]);
            return;
        }
        console.log(questionIndexToShow);
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
            // console.log(res.data);
        } else {
            return;
        }
    };

    const handlePrev = (questionId, question) => {
        if (questionIndexToShow <= 0) {
            return;
        }
        setQuestionIndexToShow((prev) => prev - 1);
        setActiveButton(questionIndexToShow - 1);
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
            // console.log(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const [shuffledOptions, setShuffledOptions] = useState([]);

    useEffect(() => {
        // This effect is run when the component mounts and whenever questionIndexToShow changes
        if (data && data.questions[questionIndexToShow]) {
            const question = data.questions[questionIndexToShow];
            const options = [
                {
                    label: "a",
                    value: question.correct_answer,
                    type: "correct_answer",
                },
                { label: "b", value: question.option_b, type: "option_b" },
                { label: "c", value: question.option_c, type: "option_c" },
                { label: "d", value: question.option_d, type: "option_d" }, // Add more options as needed
            ];
            const values = options.map((option) => option.value);
            const shuffledValues = shuffleArray(values);

            // Reconstruct options with the shuffled values
            const newShuffledOptions = shuffledValues.map((value, idx) => ({
                label: options[idx].label,
                value: value,
                type: options[idx].type,
            }));

            setShuffledOptions(newShuffledOptions);
        }
    }, [data, questionIndexToShow]); // Run this effect when the data or questionIndexToShow changes

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
                                        initialTime={
                                            data && data.exam.exam_duration
                                        }
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
                                        if (index === questionIndexToShow) {
                                            return (
                                                <div key={question.id}>
                                                    <h3 className="font-poppins font-bold my-2">
                                                        <span>Question: </span>
                                                        {index + 1}
                                                    </h3>
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html: question.question,
                                                        }}
                                                    />

                                                    {shuffledOptions.map(
                                                        (option, idx) => (
                                                            <div
                                                                key={idx} // Unique key for each option
                                                                onClick={() =>
                                                                    handleAnswer(
                                                                        option.type,
                                                                        question.id,
                                                                        question.question,
                                                                        option.value
                                                                    )
                                                                }
                                                                className={`${getDivStyle(
                                                                    option.value
                                                                )} flex items-center gap-5 w-[35rem] hover:bg-gray-500/50 cursor-pointer my-4 p-2`}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className="bg-primary-color px-2 rounded-full text-xl"
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </button>
                                                                <div
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: option.value,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        )
                                                    )}
                                                    <div class="flex justify-center my-5 gap-5">
                                                        <button
                                                            onClick={() =>
                                                                handlePrev(
                                                                    question.id,
                                                                    question.question
                                                                )
                                                            }
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
                                        return null; // Return null if not matching index
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
                                ? "text-red-600 bg-black font-bold text-2xl"
                                : ""
                        } ${
                                        clickedBtns.includes(index)
                                            ? "bg-slate-600 text-white"
                                            : ""
                                    } `} // Conditionally change the class if active
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
