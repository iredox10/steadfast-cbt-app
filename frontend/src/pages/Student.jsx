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
    const [shuffledQuestions, setShuffledQuestions] = useState([]);

    // Add useEffect to shuffle questions when data is loaded
    useEffect(() => {
        if (data?.questions) {
            const shuffled = [...data.questions];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setShuffledQuestions(shuffled);
        }
    }, [data]);

    const [answers, setAnswers] = useState([]);
    // console.log(data);

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

    const [selectedAnswers, setSelectedAnswers] = useState(() => {
        const savedAnswers = localStorage.getItem(`exam_answers_${studentId}`);
        return savedAnswers ? JSON.parse(savedAnswers) : {};
    });

    const handleAnswer = (option, questionId, question, answer) => {
        selectedAnswerRef.current = { questionId, question, answer };
        setQuestion(question);
        setSelectedOption(answer);
    //    console.log(selectedOption) 
        const newAnswers = {
            ...selectedAnswers,
            [questionId]: answer
        };
        
        setSelectedAnswers(newAnswers);
        // Save to localStorage
        localStorage.setItem(`exam_answers_${studentId}`, JSON.stringify(newAnswers));
    };

    const getPlainText = (html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || "";
    };

    const handleNext = async (questionId, question) => {
        if (questionIndexToShow === shuffledQuestions.length - 1) {
            setClickedBtns((prev) => [...prev, questionIndexToShow]);
            setSubmitModel(true)
            return;
        }
        setQuestionIndexToShow((prev) => prev + 1);
        setActiveButton(questionIndexToShow + 1);
        if (!clickedBtns.includes(questionIndexToShow)) {
            setClickedBtns((prev) => [...prev, questionIndexToShow]);
        }

        if (selectedOption) {
            const res = await axios.post(
                `${path}/answer-question/${studentId}/${questionId}/${data.exam.course_id}`,
                {
                    selected_answer: getPlainText(selectedOption),
                    question: getPlainText(question),
                    course_id: data.exam.course_Id,
                }
            );
        }
        
    };

    const handlePrev = (questionId, question) => {
        if (questionIndexToShow <= 0) {
            return;
        }
        setQuestionIndexToShow((prev) => prev - 1);
        setActiveButton(questionIndexToShow - 1);
        if (!clickedBtns.includes(questionIndexToShow)) {
            setClickedBtns((prev) => [...prev, questionIndexToShow]);
        }
    };

    const getDivStyle = (option, questionId) => {
        const storedAnswer = selectedAnswers[questionId];
        const plainStoredAnswer = getPlainText(storedAnswer);
        const plainOption = getPlainText(option);
        if (plainStoredAnswer === plainOption) {
            return 'bg-blue-500 text-white' 
        }
        return "";
    };

    const [sumbitModel, setSubmitModel] = useState();
    const [msg, setMsg] = useState();
    const [reminder, setReminder] = useState();
    const reminderRef = useRef();
    const navigate = useNavigate();

    const timeRemain = (data) => {
        // setReminder(data)
    };

    const handleSubmit = async (isAutoSubmit = false) => {
        try {
            // const res = await axios.post(
            //     `${path}/student-submit-exam/${course.id}/${studentId}`
            // );
            // Clear all exam data from localStorage
            localStorage.removeItem('examTimeRemaining');
            localStorage.removeItem('examLastTimestamp');
            localStorage.removeItem(`exam_answers_${studentId}`);
            
            // navigate("/student-submission/" + studentId);
        } catch (err) {
            console.log(err);
            alert("Error submitting exam. Please contact your administrator.");
        }
    };

    const [shuffledOptions, setShuffledOptions] = useState([]);

    useEffect(() => {
        // This effect is run when the component mounts and whenever questionIndexToShow changes
        if (data && data.questions[questionIndexToShow]) {
            const question = data.questions[questionIndexToShow];
            const options = [];

            // Only add options that exist and are not empty/null
            if (question.correct_answer) {
                options.push({
                    label: "a",
                    value: question.correct_answer,
                    type: "correct_answer",
                });
            }
            if (question.option_b) {
                options.push({
                    label: "b",
                    value: question.option_b,
                    type: "option_b",
                });
            }
            if (question.option_c) {
                options.push({
                    label: "c",
                    value: question.option_c,
                    type: "option_c",
                });
            }
            if (question.option_d) {
                options.push({
                    label: "d",
                    value: question.option_d,
                    type: "option_d",
                });
            }

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
    }, [data, questionIndexToShow]);

    // Add this useEffect to load saved answers when component mounts
    useEffect(() => {
        const savedAnswers = localStorage.getItem(`exam_answers_${studentId}`);
        if (savedAnswers) {
            setSelectedAnswers(JSON.parse(savedAnswers));
        }
    }, [studentId]);

    // Add keyboard event listener
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!shuffledQuestions[questionIndexToShow]) return;
            
            const currentQuestion = shuffledQuestions[questionIndexToShow];
            const key = e.key.toLowerCase();
            
            // Match key press to option
            if (['a', 'b', 'c', 'd'].includes(key)) {
                const optionIndex = ['a', 'b', 'c', 'd'].indexOf(key);
                if (optionIndex < shuffledOptions.length) {
                    const selectedOption = shuffledOptions[optionIndex];
                    handleAnswer(
                        selectedOption.type,
                        currentQuestion.id,
                        currentQuestion.question,
                        selectedOption.value
                    );
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [shuffledQuestions, questionIndexToShow, shuffledOptions]);

    // Add useEffect to track clicked buttons based on saved answers
    useEffect(() => {
        const savedAnswers = Object.keys(selectedAnswers);
        if (savedAnswers.length > 0) {
            // Find indices of questions that have answers
            const answeredIndices = shuffledQuestions
                .map((q, index) => savedAnswers.includes(q.id.toString()) ? index : null)
                .filter(index => index !== null);
            
            // Update clickedBtns with these indices
            setClickedBtns(answeredIndices);
        }
    }, [shuffledQuestions, selectedAnswers]);

    // Add console logs to debug

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
                                        onTimeUp={handleSubmit}
                                        reminder={timeRemain}
                                    />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <div class="">
                            <div class="bg-white/60 p-4">
                                {shuffledQuestions.map((question, index) => {
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
                                                            className={`
                                                                ${getDivStyle(option.value, question.id)} 
                                                                flex items-center gap-3 p-2 rounded 
                                                                border border-gray-200
                                                                transition-colors duration-200
                                                                cursor-pointer
                                                            `}
                                                        >
                                                            <span className={`
                                                                w-6 h-6 
                                                                flex items-center justify-center 
                                                                rounded-full border 
                                                                ${selectedAnswers[question.id] === getPlainText(option.value) 
                                                                    ? 'border-white text-white' 
                                                                    : 'border-gray-300 text-gray-600'
                                                                }
                                                                text-sm
                                                            `}>
                                                                {option.label}
                                                            </span>
                                                            <div
                                                                className={`
                                                                    text-sm flex-1
                                                                    ${selectedAnswers[question.id] === getPlainText(option.value) 
                                                                        ? 'text-white' 
                                                                        : 'text-gray-700'
                                                                    }
                                                                `}
                                                                dangerouslySetInnerHTML={{
                                                                    __html: option.value,
                                                                }}
                                                            />
                                                            <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">
                                                                Press '{idx + 1}'
                                                            </span>
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
                        {shuffledQuestions.map((question, index) => (
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
                                    onClick={() => handleSubmit(false)}
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
