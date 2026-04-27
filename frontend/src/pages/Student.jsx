import React, { useEffect, useRef, useState } from "react";
import useFetch from "../hooks/useFetch";
import { path } from "../../utils/path";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Timer from "../components/Timer";
import { parseDuration } from "../../utils/parseDuration";
import Model from "../components/Model";
import ExamSecurityProvider from "../components/ExamSecurityProvider";
import Calculator from "../components/Calculator";
import { FaTimes, FaTimesCircle, FaBook, FaUser, FaClock, FaGraduationCap, FaPaperPlane, FaExclamationTriangle, FaCalculator, FaSync } from "react-icons/fa";
import logo from "../../public/assets/buk.png";

// Simple test component to verify rendering
const TestComponent = () => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, backgroundColor: 'red', color: 'white', padding: '10px', zIndex: 9999 }}>
            Test Component Rendered
        </div>
    );
};

const Student = () => {
    const { studentId } = useParams();
    const { data, loading, err } = useFetch(`/get-student-exam/${studentId}`);

    // State for managing exam data refresh (for time extensions)
    const [liveData, setLiveData] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Initial student data
    const { data: student } = useFetch(`/get-student/${studentId}`);

    // Sync liveData with initial data
    useEffect(() => {
        if (data) setLiveData(data);
    }, [data]);

    const refreshExamData = async () => {
        setIsRefreshing(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${path}/get-student-exam/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLiveData(res.data);
            console.log("Exam data refreshed (Time sync)");
        } catch (error) {
            console.error("Error refreshing exam data:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Auto-poll for time extensions every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (!loading && liveData) {
                refreshExamData();
            }
        }, 60000); // Poll every minute

        return () => clearInterval(interval);
    }, [loading, liveData, studentId]);

    const [answers, setAnswers] = useState([]);
    const [questionIndexToShow, setQuestionIndexToShow] = useState(0);
    const [clickedBtns, setClickedBtns] = useState([]);
    const [activeButton, setActiveButton] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [sumbitModel, setSubmitModel] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [shuffledOptions, setShuffledOptions] = useState({});

    const navigate = useNavigate();

    // Use liveData for the rest of the component
    const activeData = liveData || data;

    // Get current question
    const currentQuestion = activeData?.questions?.[questionIndexToShow];

    // Generate a unique key for localStorage based on student and exam
    const localStorageKey = `exam_answers_${studentId}_${activeData?.exam?.id || 'unknown'}`;

    // Load saved answers from localStorage on component mount (first instance)
    useEffect(() => {
        if (activeData?.exam?.id && studentId) {
            const savedData = localStorage.getItem(localStorageKey);
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    // Only load saved data if it's for the same exam
                    if (parsedData.examId === activeData?.exam?.id) {
                        setAnswers(parsedData.answers || []);
                        setSelectedAnswers(parsedData.selectedAnswers || {});
                        setClickedBtns(parsedData.clickedBtns || []);
                        setQuestionIndexToShow(parsedData.questionIndexToShow || 0);
                        setActiveButton(parsedData.activeButton || 0);
                        setShuffledOptions(parsedData.shuffledOptions || {});
                    } else {
                        localStorage.removeItem(localStorageKey);
                    }
                } catch (error) {
                    localStorage.removeItem(localStorageKey);
                }
            } else if (activeData?.existing_answers?.length > 0) {
                // If no local storage but we have server answers, restore them
                const serverAnswers = {};
                const serverClickedBtns = [];

                activeData.existing_answers.forEach(ans => {
                    serverAnswers[ans.question_id] = ans.choice;
                    if (!serverClickedBtns.includes(ans.question_id)) {
                        serverClickedBtns.push(ans.question_id);
                    }
                });

                setSelectedAnswers(serverAnswers);
                setClickedBtns(serverClickedBtns);
            }
        }
    }, [activeData?.exam?.id, activeData?.existing_answers, studentId, localStorageKey]);

    useEffect(() => {
        if (activeData?.exam?.id && studentId) {
            const examData = {
                examId: activeData?.exam?.id,
                answers,
                selectedAnswers,
                clickedBtns,
                questionIndexToShow,
                activeButton,
                shuffledOptions,
                lastSync: new Date().toISOString()
            };
            localStorage.setItem(localStorageKey, JSON.stringify(examData));
        }
    }, [answers, selectedAnswers, clickedBtns, questionIndexToShow, activeButton, shuffledOptions, activeData?.exam?.id, studentId, localStorageKey]);

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

        // Create options array with original types
        const options = [
            { value: question.option_a, type: "a" },
            { value: question.option_b, type: "b" },
            { value: question.option_c, type: "c" },
            { value: question.option_d, type: "d" },
        ];

        // Filter out any options that might be null, empty, or default placeholder values
        const validOptions = options.filter(option =>
            option.value &&
            option.value.trim() !== '' &&
            !option.value.toLowerCase().includes('default option')
        );

        // Shuffle the option values
        const shuffledValues = shuffleArray(validOptions);

        // Re-assign labels A, B, C, D to the shuffled options
        const labelsArray = ["A", "B", "C", "D"];
        const shuffledWithLabels = shuffledValues.map((option, index) => ({
            ...option,
            label: labelsArray[index]
        }));

        // Store the shuffled options
        setShuffledOptions(prev => ({
            ...prev,
            [question.id]: shuffledWithLabels
        }));

        return shuffledWithLabels;
    };

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

    const handleAnswer = async (optionType, questionId, question, answer) => {
        // Update selected answers
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));

        try {
            // Make the API call to check if answer is correct
            await axios.post(`${path}/answer-question/${studentId}/${questionId}/${activeData?.exam?.course_id}`, {
                selected_answer: answer,
                question: question
            });
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
                const newAnswers = [...prev];
                newAnswers[existingAnswerIndex] = newAnswer;
                return newAnswers;
            } else {
                return [...prev, newAnswer];
            }
        });

        if (!clickedBtns.includes(questionId)) {
            setClickedBtns(prev => [...prev, questionId]);
        }
    };

    const handleSubmit = async (timeUp = false) => {
        setIsSubmitting(true);
        try {
            // First, submit each answer individually
            for (const answer of answers) {
                await axios.post(`${path}/answer-question/${studentId}/${answer.question_id}/${activeData?.exam?.course_id}`, {
                    selected_answer: answer.answer,
                    question: answer.question
                });
            }

            // Then submit the exam
            const res = await axios.get(`${path}/submit-exam/${studentId}/${activeData?.exam?.course_id}`);

            // Clear localStorage after successful submission
            localStorage.removeItem(localStorageKey);
            localStorage.removeItem("examTimeRemaining");
            localStorage.removeItem("examLastTimestamp");

            if (res.data.show_result) {
                navigate(`/student-result/${studentId}`, { state: { result: res.data }, replace: true });
            } else {
                navigate(`/student-submission/${studentId}`, { replace: true });
            }
        } catch (err) {
            console.log("Error submitting exam:", err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to submit exam. Please try again.";
            alert(`Error submitting exam: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClick = (index) => {
        setQuestionIndexToShow(index);
        setActiveButton(index);
    };

    const handleNext = (questionId, question) => {
        if (questionIndexToShow < activeData?.questions?.length - 1) {
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

    if (loading && !activeData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading exam...</p>
                </div>
            </div>
        );
    }

    if (!activeData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No exam data available.</p>
                    {err && <p className="text-red-600 mt-2">Error: {err}</p>}
                </div>
            </div>
        );
    }

    if (!activeData.exam || !activeData.questions || !Array.isArray(activeData.questions)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Incomplete exam data.</p>
                </div>
            </div>
        );
    }

    if (activeData.questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No valid questions available for this exam.</p>
                </div>
            </div>
        );
    }

    return (
        <ExamSecurityProvider
            studentId={studentId}
            examId={activeData?.exam?.id}
            securitySettings={{
                enable_fullscreen: activeData?.exam?.enable_fullscreen ?? true,
                enable_tab_switch_detection: activeData?.exam?.enable_tab_switch_detection ?? true,
                enable_copy_paste_block: activeData?.exam?.enable_copy_paste_block ?? true,
                enable_screenshot_block: activeData?.exam?.enable_screenshot_block ?? true,
                enable_multiple_monitor_check: activeData?.exam?.enable_multiple_monitor_check ?? true,
                max_violations: activeData?.exam?.max_violations ?? 3
            }}
            enabled={activeData?.exam?.enable_browser_lockdown ?? true}
            onAutoSubmit={() => handleSubmit(true)}
        >
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                                    <img src={logo} alt="BUK KANO Logo" className="w-8 h-8 object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-800">BUK KANO</h1>
                                    <p className="text-xs text-gray-600">Computer Based Test</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-6">
                                {/* Student Info */}
                                <div className="flex items-center space-x-3">
                                    {student?.image ? (
                                        <img
                                            src={`${path.replace('/api', '')}/${student.image}`}
                                            alt={student.full_name}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-100"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <FaUser className="text-blue-600" />
                                        </div>
                                    )}
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
                                            {activeData?.exam?.course_title || "Loading..."}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {activeData?.questions?.length || 0} Questions
                                        </p>
                                    </div>
                                </div>

                                {/* Calculator Toggle */}
                                <button
                                    onClick={() => setShowCalculator(!showCalculator)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${showCalculator ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    title="Toggle Calculator"
                                >
                                    <FaCalculator className={showCalculator ? 'text-blue-600' : 'text-gray-600'} />
                                    <span className="text-sm font-medium hidden sm:inline">Calculator</span>
                                </button>

                                {/* Timer */}
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <FaClock className="text-red-600" />
                                    </div>
                                    <div className="text-right">
                                        {(activeData?.exam?.exam_duration > 0) && (
                                            <div className="flex items-center gap-2">
                                                <Timer
                                                    initialTime={activeData?.exam?.exam_duration || 0}
                                                    startTime={activeData?.candidate?.start_time}
                                                    remainingSecondsServer={activeData?.exam?.remaining_seconds}
                                                    onTimeUp={handleSubmit}
                                                />
                                                <button
                                                    onClick={refreshExamData}
                                                    disabled={isRefreshing}
                                                    className={`p-1.5 rounded-full hover:bg-gray-100 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                                                    title="Sync Time"
                                                >
                                                    <FaSync className="text-xs text-gray-400" />
                                                </button>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500">Time Remaining</p>
                                        {activeData?.exam?.timer_mode === "global" && (
                                            <p className="text-xs text-blue-600 font-medium">
                                                Global Timer (All students synchronized)
                                            </p>
                                        )}
                                        {activeData?.exam?.timer_mode === "individual" && (
                                            <p className="text-xs text-purple-600 font-medium">
                                                Individual Timer
                                            </p>
                                        )}
                                        {activeData?.exam?.time_extension > 0 && (
                                            <p className="text-xs text-green-600 font-medium">
                                                +{activeData.exam.time_extension} min extended
                                            </p>
                                        )}
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
                                    {activeData?.questions && activeData.questions.length > 0 ? activeData.questions.map((question, index) => (
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
                                            {activeData?.questions ? "No questions available" : "Loading questions..."}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Answered:</span>
                                        <span className="font-medium text-green-600">
                                            {Object.keys(selectedAnswers).filter(id => activeData?.questions?.some(q => q.id.toString() === id)).length} / {activeData?.questions?.length || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-1">
                                        <span className="text-gray-600">Not Answered:</span>
                                        <span className="font-medium text-gray-600">
                                            {Math.max(0, (activeData?.questions?.length || 0) - Object.keys(selectedAnswers).filter(id => activeData?.questions?.some(q => q.id.toString() === id)).length)}
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
                                                Question {questionIndexToShow + 1} of {activeData?.questions?.length || 0}
                                            </h2>
                                            <p className="text-sm text-gray-600">
                                                {activeData?.exam?.marks_per_question || 0} marks
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setSubmitModel(true)}
                                                disabled={isSubmitting}
                                                className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md transition-all duration-300 flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <FaPaperPlane />
                                                <span>{isSubmitting ? 'Submitting...' : 'Submit Exam'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Question Content */}
                                <div className="p-6">
                                    {activeData?.questions && activeData.questions.length > 0 ? (
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
                                                                    Press '{idx + 1}'
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

                            {/* Navigation Buttons */}
                            <div className="mt-6 flex justify-center gap-4">
                                <button
                                    onClick={() => handlePrev()}
                                    disabled={questionIndexToShow === 0}
                                    className={`px-6 py-3 rounded-xl font-medium text-base shadow-sm transition-all duration-200 ${questionIndexToShow === 0
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handleNext()}
                                    disabled={questionIndexToShow === (activeData?.questions?.length || 0) - 1}
                                    className={`px-6 py-3 rounded-xl font-medium text-base shadow-sm transition-all duration-200 ${questionIndexToShow === (activeData?.questions?.length || 0) - 1
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                                        }`}
                                >
                                    Next
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
                                        disabled={isSubmitting}
                                        className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        )}
                                        {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Model>
                )}
            </div>

            {showCalculator && (
                <Calculator onClose={() => setShowCalculator(false)} />
            )}
        </ExamSecurityProvider>
    );
};

export default Student;
