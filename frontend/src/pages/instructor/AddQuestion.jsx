import React, { useState } from "react";
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

const AddQuestion = () => {
    const { userId, examId } = useParams();
    console.log(userId)
    // const { data: exam, loading, err } = useFetch(`/add-question`);
    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }], // Header options
            ["bold", "italic", "underline"], // Basic text formatting
            [{ list: "ordered" }, { list: "bullet" }], // Lists
            ["link", "image"], // Links and images
            [{ color: [] }, { background: [] }], // Color options
            ["clean"], // Clear formatting
            ["blockquote", "code-block"], // Blockquote and code
            // Add more tools here
        ],
    };

    const navigate = useNavigate()

    const [question, setQuestion] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [optionEditor, setOptionEditor] = useState("");
    const [options, setOptions] = useState([]);

    const [error, setError] = useState("");

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
        setOptions((prev) => [...prev, optionEditor]);
        setOptionEditor("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question || !correctAnswer || !options) {
            setError("fields can't be empty");
            return;
        }
        if (!options.length === 4 || options.length < 4) {
            setError("options can't be less than or more than 4");
            return;
        }

        const keys = ["option_a", "option_b", "option_c", "option_d"];

        const optionToSend = keys.reduce((acc, key, index) => {
            acc[key] = options[index];
            return acc;
        }, {});
        console.log(optionToSend.option_a)
        try {
            const res = await axios.post(
                `${path}/add-question/${userId}/${examId}`,
                {
                    user_id: userId,
                    exam_id: examId,
                    question,
                    correct_answer: correctAnswer,
                    option_a: optionToSend.option_a,
                    option_b: optionToSend.option_b,
                    option_c: optionToSend.option_c,
                    option_d: optionToSend.option_d,
                }
            );
            if(res.status == 201){
                navigate(-1)
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
            <div className="  col-span-4">
                <Header title={"Course Name"} subtitle={"Instructor"} />
                <div className="p-3 bg-white">
                    <div>
                        <h1 className="font-bold text-2xl p-3">Add Question</h1>
                    </div>
                    <form onSubmit={handleSubmit}>
                        {error && <div>{error}</div>}
                        <div className="mb-5">
                            <h2 className="font-bold text-xl my-2">Question</h2>
                            <ReactQuill
                                value={question}
                                onChange={handleQuestionChange}
                                theme="snow"
                                modules={modules}
                            />
                        </div>
                        <div className="mb-5">
                            <h2 className="font-bold text-xl my-2">
                                Correct Answer
                            </h2>
                            <ReactQuill
                                value={correctAnswer}
                                onChange={handleAnswerChange}
                                theme="snow"
                                modules={modules}
                            />
                        </div>

                        <div className="relative">
                            <h2 className="font-bold text-xl my-2">Options</h2>
                            <button
                                onClick={addOption}
                                className="absolute right-10 top-5  z-1 bg-black text-white rounded-full p-3"
                            >
                                <FaPlus />
                            </button>
                            <ReactQuill
                                value={optionEditor}
                                onChange={handleOptionEditor}
                                theme="snow"
                                modules={modules}
                            />
                        </div>
                        <button className="bg-black text-white w-full my-5 py-3 text-xl ">
                            Add
                        </button>
                    </form>
                    {/* <div>  
                <h3>Content from Editor 1:</h3>  
                <div dangerouslySetInnerHTML={{ __html: editor1Content }} />  
            </div>   */}
                </div>
            </div>{" "}
            <div className="mr-4">
                <div className="py-8">
                    <div className="">profile pic and sign out</div>
                </div>
                <div className="sticky top-0 bg-white  p-2 min-h-36 flex flex-col gap-5">
                    <div>
                        <h1>Correct Answer</h1>
                    </div>
                    <div>
                        <div>
                            <h1 className="font-bold text-xl">Options</h1>
                            <p>List of Added Options</p>
                            <div className="my-4">
                                {options &&
                                    options.map((option, i) => (
                                        <div key={i} className="my-2">
                                            <div
                                                className="bg-primary-color capitalize p-2 box-border"
                                                dangerouslySetInnerHTML={{
                                                    __html: option,
                                                }}
                                            />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddQuestion;
