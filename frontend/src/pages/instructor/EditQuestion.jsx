import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../quill.css";
import { FaPlus, FaTimes, FaSave, FaArrowLeft, FaCheck, FaInfoCircle } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { path } from "../../../utils/path";
import useFetch from "../../hooks/useFetch";

const EditQuestion = () => {
    const { questionId, userId, examId } = useParams();
    const { data: user, loading: userLoading, error: userError } = useFetch(`/get-user/${userId}`);
    
    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            [{ color: [] }, { background: [] }],
            ["clean"],
            ["blockquote", "code-block"],
        ],
    };

    const navigate = useNavigate();
    const [question, setQuestion] = useState("");
    const [optionEditor, setOptionEditor] = useState("");
    const [options, setOptions] = useState([]);
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0); // Track which option is correct
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                setLoading(true);
                const res = await axios(`${path}/get-question/${questionId}`);
                if (res.status === 200) {
                    setQuestion(res.data.question);
                    // Create options array with all options
                    const allOptions = [
                        res.data.correct_answer,
                        res.data.option_b,
                        res.data.option_c,
                        res.data.option_d,
                    ].filter((option) => option !== null && option !== "");
                    setOptions(allOptions);
                    // Set the first option as the default correct answer (maintaining current behavior)
                    // Note: In the future, we could enhance this to determine which option is actually correct
                    setCorrectAnswerIndex(0);
                }
            } catch (error) {
                console.log(error);
                setError("Failed to load question");
            } finally {
                setLoading(false);
            }
        };
        fetchQuestion();
    }, [questionId]);

    // Handle changes for each editor
    const handleQuestionChange = (content) => {
        setQuestion(content);
    };

    const handleAnswerChange = (content) => {
        // Update the first option as the correct answer (for backward compatibility)
        if (options.length > 0) {
            const newOptions = [...options];
            newOptions[0] = content;
            setOptions(newOptions);
        } else {
            setOptions([content]);
        }
    };

    const handleOptionEditor = (content) => {
        setOptionEditor(content);
    };

    const addOption = () => {
        if (optionEditor === "") {
            setError("Option can't be empty");
            return;
        }
        if (options.length >= 4) {
            setError("You can't add more than 4 options");
            return;
        }
        setOptions((prev) => [...prev, optionEditor]);
        setOptionEditor("");
    };

    const removeOption = (index) => {
        const newValue = options.filter((option, i) => i !== index);
        setOptions(newValue);
        
        // If we're removing the correct answer, reset to first option
        if (index === correctAnswerIndex) {
            setCorrectAnswerIndex(0);
        } 
        // If we're removing an option before the correct answer, adjust the index
        else if (index < correctAnswerIndex) {
            setCorrectAnswerIndex(correctAnswerIndex - 1);
        }
        // If we're removing the last option and it was the correct answer, reset to first option
        else if (correctAnswerIndex >= newValue.length) {
            setCorrectAnswerIndex(0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question || options.length === 0) {
            setError("Question and at least one option are required");
            return;
        }
        if (options.length < 2) {
            setError("At least 2 options are required");
            return;
        }
        setError("");

        // Get the correct answer based on selected index
        const correctAnswer = options[correctAnswerIndex] || options[0];
        
        try {
            setLoading(true);
            const res = await axios.patch(
                `${path}/edit-question/${questionId}`,
                {
                    user_id: userId,
                    exam_id: examId,
                    question,
                    correct_answer: correctAnswer,
                    option_b: options[1] || "",
                    option_c: options[2] || "",
                    option_d: options[3] || "",
                }
            );
            if (res.status === 200) {
                navigate(-1);
            }
        } catch (err) {
            setError("Failed to update question");
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <Sidebar>
                <Link
                    to={`/exam-questions/${userId}/${examId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <i className="fas fa-arrow-left"></i>
                    <span>Back to Questions</span>
                </Link>
                <Link
                    to={`/exams/${userId}/${examId}`}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <i className="fas fa-file-alt"></i>
                    <span>Exams</span>
                </Link>
            </Sidebar>
            
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Question</h1>
                        <p className="text-gray-600 mt-1">Update your exam question</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <i className="fas fa-user text-blue-600"></i>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">{user?.full_name || 'Instructor'}</h3>
                                <p className="text-sm text-gray-500">Instructor</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Question Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            {error && (
                                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded mb-6">
                                    <p>{typeof error === 'object' ? error.error || error.message || 'An error occurred' : error}</p>
                                </div>
                            )}

                            {loading && !question ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Question Text
                                        </label>
                                        <div className="border border-gray-200 rounded-lg">
                                            <ReactQuill
                                                value={question}
                                                onChange={handleQuestionChange}
                                                theme="snow"
                                                modules={modules}
                                                className="min-h-[200px]"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Answer Options
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addOption}
                                                disabled={options.length >= 4 || loading}
                                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                            >
                                                <FaPlus />
                                                <span>Add Option</span>
                                            </button>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg">
                                            <ReactQuill
                                                value={optionEditor}
                                                onChange={handleOptionEditor}
                                                theme="snow"
                                                modules={modules}
                                                className="min-h-[150px]"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <FaInfoCircle className="h-5 w-5 text-blue-400" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-blue-700">
                                                        <strong>How to set the correct answer:</strong> After adding all options, 
                                                        select which one is the correct answer in the preview panel on the right.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                    <span>Updating...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave />
                                                    <span>Update Question</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <i className="fas fa-user text-blue-600"></i>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{user?.full_name || 'Instructor'}</h3>
                                    <p className="text-sm text-gray-500">Instructor</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(-1)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <FaArrowLeft />
                                <span>Back</span>
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">Select Correct Answer</h2>
                                <p className="text-sm text-gray-500 mb-4">Choose which option is the correct answer for this question</p>
                                
                                <div className="space-y-3">
                                    {options && options.map((option, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-start p-4 border rounded-lg transition-colors ${
                                                correctAnswerIndex === index
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                id={`correct-answer-${index}`}
                                                name="correct-answer"
                                                value={index}
                                                checked={correctAnswerIndex === index}
                                                onChange={() => setCorrectAnswerIndex(index)}
                                                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500"
                                            />
                                            <label 
                                                htmlFor={`correct-answer-${index}`}
                                                className="ml-3 flex-1 cursor-pointer"
                                            >
                                                <div className="font-medium text-gray-900 mb-1">
                                                    Option {String.fromCharCode(65 + index)}
                                                </div>
                                                <div 
                                                    className="text-gray-700 break-words overflow-auto max-h-32"
                                                    dangerouslySetInnerHTML={{ __html: option }} 
                                                />
                                                {correctAnswerIndex === index && (
                                                    <span className="inline-flex items-center mt-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                        <FaCheck className="mr-1" /> Selected as correct answer
                                                    </span>
                                                )}
                                            </label>
                                        </div>
                                    ))}
                                    
                                    {(!options || options.length === 0) && (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No options available yet</p>
                                            <p className="text-sm mt-1">Add options below to select the correct answer</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Answer Options</h2>
                                        <p className="text-sm text-gray-500">Options for this question</p>
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {options?.length || 0} options
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {options && options.map((option, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center justify-between p-4 bg-white border rounded-lg hover:border-gray-300 transition-colors ${
                                                correctAnswerIndex === index
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200'
                                            }`}
                                        >
                                            <div className="flex-1 mr-4">
                                                <div className="flex items-center mb-2">
                                                    <span className="font-medium text-gray-900 mr-2">
                                                        Option {String.fromCharCode(65 + index)}
                                                    </span>
                                                    {correctAnswerIndex === index && (
                                                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                            <FaCheck className="mr-1" /> Correct Answer
                                                        </span>
                                                    )}
                                                </div>
                                                <div 
                                                    className="text-gray-700 break-words overflow-auto max-h-32"
                                                    dangerouslySetInnerHTML={{ __html: option }} 
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => removeOption(index)}
                                                    disabled={loading}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Remove option"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EditQuestion;