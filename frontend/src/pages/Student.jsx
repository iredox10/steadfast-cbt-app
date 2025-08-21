import React, { useEffect, useRef, useState } from "react";
import useFetch from "../hooks/useFetch";
import { path } from "../../utils/path";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Timer from "../components/Timer";
import { parseDuration } from "../../utils/parseDuration";
import Model from "../components/Model";
import { FaTimes, FaTimesCircle, FaBook, FaUser, FaClock, FaGraduationCap, FaPaperPlane, FaExclamationTriangle } from "react-icons/fa";

// Simple test component to verify rendering
const TestComponent = () => {
    return (
        <div style={{position: 'fixed', top: 0, left: 0, backgroundColor: 'red', color: 'white', padding: '10px', zIndex: 9999}}>
            Test Component Rendered
        </div>
    );
};

const Student = () => {
    console.log('Student component constructor called');
    
    const { studentId } = useParams();
    const { data, loading, err } = useFetch(`/get-student-exam`);
    const [answers, setAnswers] = useState([]);

    const { data: student } = useFetch(`/get-student/${studentId}`);
    const [course, setCourse] = useState();
    const [questionIndexToShow, setQuestionIndexToShow] = useState(0);
    const [clickedBtns, setClickedBtns] = useState([]);
    const [activeButton, setActiveButton] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showModel, setShowModel] = useState(false);
    const [sumbitModel, setSubmitModel] = useState(false);

    // Store shuffled options for each question to prevent reshuffling
    const [shuffledOptions, setShuffledOptions] = useState({});

    const navigate = useNavigate();

    // Debug logging for all state variables
    console.log('=== Student component render ===');
    console.log('studentId:', studentId);
    console.log('data:', data);
    console.log('loading:', loading);
    console.log('err:', err);
    console.log('student:', student);

    // Check for JavaScript errors
    try {
        // Get current question
        const currentQuestion = data?.questions?.[questionIndexToShow];
        console.log('currentQuestion:', currentQuestion);
        console.log('questionIndexToShow:', questionIndexToShow);
        console.log('Total questions:', data?.questions?.length);

        // Generate a unique key for localStorage based on student and exam
        const localStorageKey = `exam_answers_${studentId}_${data?.exam?.id || 'unknown'}`;
        console.log('localStorageKey:', localStorageKey);
    } catch (error) {
        console.error('Error in component rendering:', error);
    }

    // Debug logging for all state variables
    console.log('Student component state:', {
        studentId,
        data,
        loading,
        err,
        student,
        answers,
        selectedAnswers,
        questionIndexToShow,
        activeButton
    });

    // Get current question
    const currentQuestion = data?.questions?.[questionIndexToShow];
    console.log('Current question:', currentQuestion);
    console.log('Question index to show:', questionIndexToShow);
    console.log('Total questions:', data?.questions?.length);

    // Generate a unique key for localStorage based on student and exam
    const localStorageKey = `exam_answers_${studentId}_${data?.exam?.id || 'unknown'}`;

    // Load saved answers from localStorage on component mount
    useEffect(() => {
        console.log('Checking for saved data with:', {
            examId: data?.exam?.id,
            studentId,
            localStorageKey
        });

        if (data?.exam?.id && studentId) {
            const savedData = localStorage.getItem(localStorageKey);
            console.log('Found saved data:', savedData);

            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    console.log('Parsed saved data:', parsedData);

                    // Only load saved data if it's for the same exam
                    if (parsedData.examId === data?.exam?.id) {
                        setAnswers(parsedData.answers || []);
                        setSelectedAnswers(parsedData.selectedAnswers || {});
                        setClickedBtns(parsedData.clickedBtns || []);
                        setQuestionIndexToShow(parsedData.questionIndexToShow || 0);
                        setActiveButton(parsedData.activeButton || 0);
                        setShuffledOptions(parsedData.shuffledOptions || {});
                        console.log("Loaded saved exam data from localStorage");
                    } else {
                        console.log("Saved data is for a different exam, clearing it");
                        localStorage.removeItem(localStorageKey);
                    }
                } catch (error) {
                    console.error("Error parsing saved exam data:", error);
                    // Clear invalid data
                    localStorage.removeItem(localStorageKey);
                }
            }
        }
    }, [data?.exam?.id, studentId, localStorageKey]);

    // Load saved answers from localStorage on component mount
    useEffect(() => {
        if (data?.exam?.id && studentId) {
            const savedData = localStorage.getItem(localStorageKey);
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    setAnswers(parsedData.answers || []);
                    setSelectedAnswers(parsedData.selectedAnswers || {});
                    setClickedBtns(parsedData.clickedBtns || []);
                    setQuestionIndexToShow(parsedData.questionIndexToShow || 0);
                    setActiveButton(parsedData.activeButton || 0);
                    setShuffledOptions(parsedData.shuffledOptions || {});
                    console.log("Loaded saved exam data from localStorage");
                } catch (error) {
                    console.error("Error parsing saved exam data:", error);
                    // Clear invalid data
                    localStorage.removeItem(localStorageKey);
                }
            }
        }
    }, [data?.exam?.id, studentId, localStorageKey]);

    // Save answers to localStorage whenever they change
    useEffect(() => {
        if (data?.exam?.id && studentId) {
            const examData = {
                examId: data?.exam?.id, // Include examId for validation
                answers,
                selectedAnswers,
                clickedBtns,
                questionIndexToShow,
                activeButton,
                shuffledOptions,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(localStorageKey, JSON.stringify(examData));
        }
    }, [answers, selectedAnswers, clickedBtns, questionIndexToShow, activeButton, shuffledOptions, data?.exam?.id, studentId, localStorageKey]);

    // Load saved answers from localStorage on component mount
    useEffect(() => {
        if (data?.exam?.id && studentId) {
            const savedData = localStorage.getItem(localStorageKey);
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    setAnswers(parsedData.answers || []);
                    setSelectedAnswers(parsedData.selectedAnswers || {});
                    setClickedBtns(parsedData.clickedBtns || []);
                    setQuestionIndexToShow(parsedData.questionIndexToShow || 0);
                    setActiveButton(parsedData.activeButton || 0);
                    setShuffledOptions(parsedData.shuffledOptions || {});
                    console.log("Loaded saved exam data from localStorage");
                } catch (error) {
                    console.error("Error parsing saved exam data:", error);
                    // Clear invalid data
                    localStorage.removeItem(localStorageKey);
                }
            }
        }
    }, [data?.exam?.id, studentId, localStorageKey]);
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };
    const getShuffledOptions = (question) => {
        if (!question) return [];

        // If we already have shuffled options for this question, return them
        if (shuffledOptions[question.id]) {
            return shuffledOptions[question.id];
        }

        // Create new shuffled options for this question
        const options = [
            { label: "A", value: question.option_a, type: "a" },
            { label: "B", value: question.option_b, type: "b" },
            { label: "C", value: question.option_c, type: "c" },
            { label: "D", value: question.option_d, type: "d" },
        ];

        // Filter out any options that might be null, empty, or default placeholder values
        const validOptions = options.filter(option => 
            option.value && 
            option.value.trim() !== '' && 
            !option.value.toLowerCase().includes('default option')
        );

        const shuffled = shuffleArray(validOptions);

        // Store the shuffled options
        setShuffledOptions(prev => ({
            ...prev,
            [question.id]: shuffled
        }));

        return shuffled;
    };

    // Get shuffled options for current question (consistent order)
    const currentShuffledOptions = currentQuestion ? getShuffledOptions(currentQuestion) : [];

    // Handle keyboard navigation for options
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only handle key events when we have a current question
            if (!currentQuestion) return;

            const currentOptions = getShuffledOptions(currentQuestion);

            // Handle number keys 1-4 for options A-D
            if (e.key >= '1' && e.key <= '4') {
                const optionIndex = parseInt(e.key) - 1;
                if (optionIndex < currentOptions.length) {
                    const selectedOption = currentOptions[optionIndex];
                    handleAnswer(
                        selectedOption.type,
                        currentQuestion.id,
                        currentQuestion.question,
                        selectedOption.value
                    );
                }
            }

            // Handle arrow keys for navigation
            if (e.key === 'ArrowRight') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentQuestion, questionIndexToShow, activeButton]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios(
                    `${path}/get-course-exam-questions/${data?.exam?.course_id}`
                );
                setCourse(res.data);
            } catch (err) { }
        };
        fetch();
    }, [data]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(
                    `${path}/get-course/${data?.exam?.course_id}`
                );
                setCourse(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        if (data?.exam?.course_id) {
            fetch();
        }
    }, [data]);

    // Function to handle answer selection
    const handleAnswer = async (optionType, questionId, question, answer) => {
        // Log the selected answer details
        console.log('Answer selected:', { 
            optionType,
            questionId,
            question,
            answer,
            courseId: data?.exam?.course_id
        });
        
        // Update selected answers
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));

        try {
            // Make the API call to check if answer is correct
            const response = await axios.post(`${path}/answer-question/${studentId}/${questionId}/${data?.exam?.course_id}`, {
                selected_answer: answer,
                question: question
            });
            
            // Log the complete response for debugging
            console.log('Answer submission response:', response.data);
            
            // Log if answer was correct with more details
            if (response.data.is_correct) {
                console.log('%c ✓ Correct Answer!', 'color: green; font-weight: bold; font-size: 14px;', {
                    questionId,
                    selectedAnswer: answer,
                    response: response.data
                });
            } else {
                console.log('%c ✗ Incorrect Answer', 'color: red; font-weight: bold; font-size: 14px;', {
                    questionId,
                    selectedAnswer: answer,
                    response: response.data
                });
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
        }

        // Update answers array
        setAnswers((prev) => {
            const existingAnswerIndex = prev.findIndex(a => a.question_id === questionId);
            const newAnswer = {
                question_id: questionId,
                question: question,
                answer: answer,
                answer_type: optionType
            };

            if (existingAnswerIndex >= 0) {
                // Update existing answer
                const newAnswers = [...prev];
                newAnswers[existingAnswerIndex] = newAnswer;
                return newAnswers;
            } else {
                // Add new answer
                return [...prev, newAnswer];
            }
        });

        // Add to clicked buttons if not already there
        if (!clickedBtns.includes(questionId)) {
            setClickedBtns(prev => [...prev, questionId]);
        }
    };

    const handleSubmit = async (timeUp = false) => {
        try {
            // First, submit each answer individually
            for (const answer of answers) {
                console.log('Submitting answer:', {
                    question_id: answer.question_id,
                    selected_answer: answer.answer,
                    course_id: data?.exam?.course_id
                });
                
                await axios.post(`${path}/answer-question/${studentId}/${answer.question_id}/${data?.exam?.course_id}`, {
                    selected_answer: answer.answer,
                    question: answer.question
                });
            }

            // Then submit the exam
            const res = await axios.get(`${path}/submit-exam/${studentId}/${data?.exam?.course_id}`);

            // Clear localStorage after successful submission
            localStorage.removeItem(localStorageKey);

            // Clear timer data as well
            localStorage.removeItem("examTimeRemaining");
            localStorage.removeItem("examLastTimestamp");

            navigate(`/student-submission/${studentId}`);
        } catch (err) {
            console.log("Error submitting exam:", err);
            // Don't clear localStorage on error, so student can retry
            alert("Error submitting exam. Please try again.");
        }
    };

    const handleClick = (index) => {
        setQuestionIndexToShow(index);
        setActiveButton(index);
    };

    const handleNext = (questionId, question) => {
        if (questionIndexToShow < data?.questions?.length - 1) {
            setQuestionIndexToShow((prev) => prev + 1);
            setActiveButton((prev) => prev + 1);
        }
    };

    const handlePrev = (questionId, question) => {
        if (questionIndexToShow > 0) {
            setQuestionIndexToShow((prev) => prev - 1);
            setActiveButton((prev) => prev - 1);
        }
    };

    if (loading) {
        console.log('Component is loading...');
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading exam...</p>
                </div>
            </div>
        );
    }

    // Check if we have data
    if (!data) {
        console.log('No data available');
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No exam data available.</p>
                    {err && <p className="text-red-600 mt-2">Error: {err}</p>}
                </div>
            </div>
        );
    }

    console.log('Rendering main content with data:', data);

    // Check if we have the required data structure
    if (!data.exam || !data.questions || !Array.isArray(data.questions)) {
        console.log('Incomplete data structure:', data);
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Incomplete exam data.</p>
                    {err && <p className="text-red-600 mt-2">Error: {err}</p>}
                </div>
            </div>
        );
    }

    // Check if we have questions
    if (data.questions.length === 0) {
        console.log('No valid questions available');
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No valid questions available for this exam.</p>
                    <p className="text-gray-500 text-sm mt-2">Please contact your instructor to add valid questions to the exam.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                                <FaGraduationCap className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">BUK KANO</h1>
                                <p className="text-xs text-gray-600">Computer Based Test</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            {/* Student Info */}
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FaUser className="text-blue-600" />
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {student && student.full_name ? student.full_name : 'Loading...'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {student && student.candidate_no ? student.candidate_no : 'Loading...'}
                                    </p>
                                </div>
                            </div>

                            {/* Course Info */}
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <FaBook className="text-purple-600" />
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {course?.title || "Loading..."}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {data?.questions?.length || 0} Questions
                                    </p>
                                </div>
                            </div>

                            {/* Timer */}
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <FaClock className="text-red-600" />
                                </div>
                                <div className="text-right">
                                    {data && (
                                        <Timer
                                            initialTime={data?.exam?.exam_duration || 0}
                                            onTimeUp={handleSubmit}
                                        />
                                    )}
                                    <p className="text-xs text-gray-500">Time Remaining</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Question Navigation Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                <FaBook className="mr-2 text-blue-600" />
                                Question Navigator
                            </h3>
                            <div className="grid grid-cols-5 gap-2">
                                {data?.questions && data.questions.length > 0 ? data.questions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleClick(index)}
                                        className={`
                                            w-10 h-10 rounded-lg text-sm font-medium
                                            transition-all duration-200
                                            flex items-center justify-center
                                            ${activeButton === index
                                                ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-1"
                                                : selectedAnswers[question.id]
                                                    ? "bg-green-500 text-white"  // Green for answered questions
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }
                                        `}
                                    >
                                        {index + 1}
                                    </button>
                                )) : (
                                    <div className="col-span-5 text-center py-4 text-gray-500">
                                        {data?.questions ? "No questions available" : "Loading questions..."}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Answered:</span>
                                    <span className="font-medium text-green-600">
                                        {Object.keys(selectedAnswers).length} / {data?.questions?.length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-1">
                                    <span className="text-gray-600">Not Answered:</span>
                                    <span className="font-medium text-gray-600">
                                        {(data?.questions?.length || 0) - Object.keys(selectedAnswers).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            {/* Question Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">
                                            Question {questionIndexToShow + 1} of {data?.questions?.length || 0}
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {data?.exam?.marks_per_question || 0} marks
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handlePrev()}
                                            disabled={questionIndexToShow === 0}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm ${questionIndexToShow === 0
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                }`}
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handleNext()}
                                            disabled={questionIndexToShow === (data?.questions?.length || 0) - 1}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm ${questionIndexToShow === (data?.questions?.length || 0) - 1
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-blue-600 text-white hover:bg-blue-700"
                                                }`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Question Content */}
                            <div className="p-6">
                                {data?.questions && data.questions.length > 0 ? (
                                    currentQuestion ? (
                                        <div className="space-y-6">
                                            {/* Question Text */}
                                            <div
                                                className="text-gray-800 text-lg leading-relaxed"
                                                dangerouslySetInnerHTML={{
                                                    __html: currentQuestion.question,
                                                }}
                                            />

                                            {/* Answer Options */}
                                            <div className="space-y-3">
                                                {currentShuffledOptions.map((option, idx) => {
                                                    const isSelected = selectedAnswers[currentQuestion.id] === option.value;

                                                    return (
                                                        <div
                                                            key={idx}
                                                            onClick={() =>
                                                                handleAnswer(
                                                                    option.type,
                                                                    currentQuestion.id,
                                                                    currentQuestion.question,
                                                                    option.value
                                                                )
                                                            }
                                                            className={`
                                                                flex items-center gap-4 p-4 rounded-xl border
                                                                transition-all duration-200 cursor-pointer
                                                                ${isSelected
                                                                    ? 'bg-blue-100 border-blue-500 shadow-sm'
                                                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                                }
                                                            `}
                                                        >
                                                            <span className={`
                                                                w-8 h-8 flex items-center justify-center rounded-full border font-medium
                                                                ${isSelected
                                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                                    : 'border-gray-300 text-gray-600'
                                                                }
                                                            `}>
                                                                {option.label}
                                                            </span>
                                                            <div
                                                                className={`
                                                                    flex-1
                                                                    ${isSelected
                                                                        ? 'text-blue-800 font-medium'
                                                                        : 'text-gray-700'
                                                                    }
                                                                `}
                                                                dangerouslySetInnerHTML={{
                                                                    __html: option.value,
                                                                }}
                                                            />
                                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                                Press '{option.label}'
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <p className="text-gray-600">No question available.</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading question...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setSubmitModel(true)}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                            >
                                <FaPaperPlane />
                                <span>Submit Exam</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Submit Confirmation Modal */}
            {sumbitModel && (
                <Model>
                    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
                                <FaExclamationTriangle className="h-8 w-8 text-yellow-600" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Submit Exam?
                            </h3>
                            <p className="text-gray-600 mb-8">
                                Are you sure you want to submit your exam? This action cannot be undone.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button
                                    onClick={() => setSubmitModel(false)}
                                    className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleSubmit(false)}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors duration-200"
                                >
                                    Yes, Submit
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
