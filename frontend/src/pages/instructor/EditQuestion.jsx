import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import "../../quill.css";
import { FaPlus } from "react-icons/fa6";
import Sidebar from "../../components/Sidebar";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import { path } from "../../../utils/path";
import { FaTimes } from "react-icons/fa";

const EditQuestion = () => {
    const { questionId, userId, examId } = useParams();
    const {data:user, loading:userLoading , error:userError} = useFetch(`/get-user/${userId}`)
    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }], // Header options
            ["bold", "italic", "underline"], // Basic text formatting
            [{ list: "ordered" }, { list: "bullet" }], // Lists
            ["link", "image"], // Links and images
            [{ color: [] }, { background: [] }], // Color options
            ["clean"], // Clear formatting
            ["blockquote", "code-block"], // Blockquote and code
            // [{ image: imageHandler }, "clean"],
            // Add more tools here
        ],
    };

    const navigate = useNavigate();
    const [question, setQuestion] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [optionEditor, setOptionEditor] = useState("");
    const [options, setOptions] = useState([]);

    const [error, setError] = useState("");

    const [questionObj, setQuestionObj] = useState();
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios(`${path}/get-question/${questionId}`);
                // console.log(res.data);
                if (res.status == 200) {
                    setTimeout(() => {
                        setQuestion(res.data.question);
                        setCorrectAnswer(res.data.correct_answer);
                        const backendOptions = [
                            res.data.option_b,
                            res.data.option_c,
                            res.data.option_d,
                        ].filter((option) => option !== null);
                        setOptions([
                            res.data.correct_answer,
                            ...backendOptions,
                        ]);
                    }, 1000);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetch();
    }, [questionId]);

    // Handle changes for each editor
    const handleQuestionChange = (content) => {
        setQuestion(content);
    };

    const handleAnswerChange = (content) => {
        setCorrectAnswer(content);
    };

    const handleOptionEditor = (content) => {
        setOptionEditor(content);
    };

    const addOption = () => {
        if (optionEditor == "") {
            setError("Option can't be empty");
            return;
        }
        if (options.length == 4) {
            setError("You can't add more than 4 options");
            return;
        }
        setOptions((prev) => [...prev, optionEditor]);
        setOptionEditor("");
        if (options.length == 1) {
            setCorrectAnswer(options[0]);
        }
        console.log("Current options:", [...options, optionEditor]); // This will show the actual updated array
    };

    const removeOption = (i) => {
        const newValue = options.filter((option, index) => index !== i);
        setOptions(newValue);
        if (newValue.length !== 0) {
            setCorrectAnswer(newValue[0]);
        }
        if (newValue.length == 0) {
            setCorrectAnswer("");
        }
        if (newValue.length == 1) {
            setCorrectAnswer(newValue[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question || !correctAnswer || !options) {
            setError("fields can't be empty");
            return;
        }
        if (!options || options.length < 2) {
            setError("options can't be less than or more than 2");
            return;
        }
        setError("");
        const keys = ["option_a", "option_b", "option_c", "option_d"];
        const optionToSend = keys.reduce((acc, key, index) => {
            acc[key] = options[index];
            return acc;
        }, {});
        console.log(optionToSend.option_a);
        try {
            const res = await axios.patch(
                `${path}/edit-question/${questionId}`,
                {
                    user_id: userId,
                    exam_id: examId,
                    question,
                    correct_answer: correctAnswer,
                    // option_a: optionToSend.option_a, //! I remove this to let user select correct answer
                    option_b: optionToSend.option_b,
                    option_c: optionToSend.option_c,
                    option_d: optionToSend.option_d,
                }
            );
            if (res.status == 201) {
                navigate(-1);
            }
            console.log(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div class="grid grid-cols-6 gap-5 h-screen">
            <Sidebar>
                <Link
                    href="#"
                    class="text-start bg-secondary-color text-black rounded-l-3xl w-full p-3 "
                >
                    Course
                </Link>
                <Link href="#" class="p-3">
                    Questions
                </Link>
                <Link href="#" class="p-3">
                    Candidates
                </Link>
            </Sidebar>
            <div className="col-span-3">
                <Header title={"Course Name"} subtitle={"Instructor"} />
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
                        <p className="text-gray-600 mt-1">Update your exam question</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                                <p>{error}</p>
                            </div>
                        )}

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
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <FaPlus className="w-4 h-4" />
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
                            <button
                                type="submit"
                                className="w-full px-4 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <span>Update Question</span>
                                <i className="fas fa-save"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

           <div className="mr-4 col-start-5 col-end-7">
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <i className="fas fa-user text-blue-600"></i>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">{user?.full_name}</h3>
                                <p className="text-sm text-gray-500">Instructor</p>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-500">
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>

                <div className="sticky top-4 bg-white rounded-lg shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Correct Answer</h2>
                        <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                            {correctAnswer ? (
                                <div dangerouslySetInnerHTML={{ __html: correctAnswer }}></div>
                            ) : (
                                <p className="text-gray-500 text-sm">No correct answer selected yet</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Answer Options</h2>
                                <p className="text-sm text-gray-500">The first option is the correct answer</p>
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {options?.length || 0} options
                            </span>
                        </div>

                        <div className="space-y-3">
                            {options && options.map((option, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                                >
                                    <div className="flex-1 mr-4 break-words overflow-auto max-h-32" dangerouslySetInnerHTML={{ __html: option }} />
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* <button
                                            onClick={() => setCorrectAnswer(option)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                correctAnswer === option 
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                            title="Set as correct answer"
                                        >
                                            <i className="fas fa-check"></i>
                                        </button> */}
                                        <button
                                            onClick={() => removeOption(i)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
    );
};

export default EditQuestion;
