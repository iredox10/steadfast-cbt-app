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
    const [studentAnswers, setStudentAnswers] = useState([]);

    const selectedAnswerRef = useRef();

    useEffect(() => {
        const set = () => {
            data && setQuestionToShow(data.questions[0]);
            setClickedBtns((prev) => [...prev, 0]);
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
                                class=" text-white p-2 font-bold"
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
                            <div className="bg-white rounded-lg shadow-sm p-4 my-2">
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <div className="flex gap-4">
                                        <span>
                                            <span className="font-semibold text-gray-600">Course:</span>{" "}
                                            <span className="text-gray-900">{course && course.title}</span>
                                        </span>
                                        <span>
                                            <span className="font-semibold text-gray-600">Code:</span>{" "}
                                            <span className="text-gray-900">{course && course.code}</span>
                                        </span>
                                    </div>
                                    <span>
                                        <span className="font-semibold text-gray-600">Date:</span>{" "}
                                        <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
                                    </span>
                                </div>
                                
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-2 text-sm">
                                    <span className="font-semibold text-blue-800">Instructions:</span>{" "}
                                    <span className="text-blue-900">{data && data.exam.instructions}</span>
                                </div>
                            </div>

                            <div class="bg-white/60 p-4">
                                {data &&
                                    data.questions.map((question, index) => {
                                        if (index === questionIndexToShow) {
                                            return (
                                                <div key={question.id} className="bg-white rounded-lg shadow-sm p-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                                            Q{index + 1} • {data.exam.marks_per_question} marks
                                                        </span>
                                                    </div>

                                                    <div 
                                                        className="text-gray-800 text-base mb-4"
                                                        dangerouslySetInnerHTML={{
                                                            __html: question.question,
                                                        }}
                                                    />

                                                    <div className="space-y-2">
                                                        {shuffledOptions.map((option, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={() =>
                                                                    handleAnswer(
                                                                        option.type,
                                                                        question.id,
                                                                        question.question,
                                                                        option.value
                                                                    )
                                                                }
                                                                className={`${getDivStyle(option.value)} 
                                                                    flex items-center gap-3 p-2 rounded border border-gray-100
                                                                    hover:bg-gray-50 cursor-pointer`}
                                                            >
                                                                <span className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-sm">
                                                                    {option.label}
                                                                </span>
                                                                <div
                                                                    className="text-sm text-gray-700"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: option.value,
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex justify-between mt-4">
                                                        <button
                                                            onClick={() => handlePrev(question.id, question.question)}
                                                            className="px-4 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                                                        >
                                                            Previous
                                                        </button>
                                                        <button
                                                            onClick={() => handleNext(question.id, question.question)}
                                                            className="px-4 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm mr-4">
                    <div className="grid grid-cols-10 gap-1">
                        {data && data.questions.map((question, index) => (
                            <button
                                key={index}
                                onClick={() => handleClick(index)}
                                className={`
                                    w-8 h-8 rounded-full text-sm font-medium
                                    transition-all duration-200 ease-in-out
                                    flex items-center justify-center
                                    transform hover:scale-105
                                    shadow-sm hover:shadow-md
                                    ${activeButton === index 
                                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white ring-2 ring-blue-400 ring-offset-2" 
                                        : clickedBtns.includes(index)
                                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                    }
                                `}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="my-6 flex justify-center">
                    <button
                        onClick={() => setSubmitModel(true)}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
                    >
                        <span>Submit Exam</span>
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
            {showModel && <div className="absolute bg-black"></div>}
            {sumbitModel && (
                <Model>
                    <div className="bg-white p-8 rounded-lg shadow-lg  w-full">
                        <div className="text-center">
                            <div className="mb-6">
                                <i className="fas fa-exclamation-circle text-yellow-500 text-4xl"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Submit Exam?
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Are you sure you want to submit your exam? This action cannot be undone.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                    Yes, Submit
                                </button>
                                <button
                                    onClick={() => setSubmitModel(false)}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                >
                                    Cancel
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
