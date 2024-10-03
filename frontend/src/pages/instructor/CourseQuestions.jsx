import { FaEye, FaPenToSquare } from "react-icons/fa6";
import { Link, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import useFetch from "../../hooks/useFetch";
import { useState } from "react";
import Model from "../../components/Model";
import { path } from "../../../utils/path";
import { FaTimes } from "react-icons/fa";
import axios from "axios";

const CourseQuestions = () => {
    const { userId, examId } = useParams();
    const [showModel, setShowModel] = useState(false);
    const [question, setQuestion] = useState(null);
    const {
        data: questions,
        loading,
        err,
    } = useFetch(`/get-questions/${examId}`);
    console.log(questions);

    const showQuestionDetail = async (questionId) => {
        setShowModel(true);
        try {
            const res = await axios(`${path}/get-question/${questionId}`);
            setQuestion(res.data);
            console.log(question);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div class="grid grid-cols-6 h-screen">
            <Sidebar />
            <div className="col-start-2 col-end-7 p-5">
                <div>
                    <div className="sticky top-0 bg-primary-color z-10 flex items-center justify-between">
                        <Header title={"Course Name"} subtitle={"Instructor"} />
                        <Link
                            to={`/add-question/${userId}/${examId}`}
                            className="bg-black text-white p-2 capitalize"
                        >
                            add question
                        </Link>
                    </div>
                    <div className="flex flex-col gap-5 relative">
                        <div className="grid grid-cols-2 gap-5">
                            {loading && <p>loading...</p>}
                            {questions &&
                                questions.map((q) => (
                                    <div id="questionsWrapper">
                                        <div class="bg-white/70 p-5">
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: q.question,
                                                }}
                                                class="my-2"
                                            ></div>
                                            <div class="flex justify-end gap-5">
                                                <button
                                                    id="view-question"
                                                    onClick={() =>
                                                        showQuestionDetail(q.id)
                                                    }
                                                >
                                                    <FaEye />
                                                </button>
                                                <button id="edit-question">
                                                    <FaPenToSquare />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-center">
                                            {/* <button>1 2 3 4 5</button> */}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
            {showModel && (
                <Model>
                    {question ? (
                        <div className="p-5 relative">
                            <button
                                className="absolute top-4 right-4 bg-black rounded text-white p-1"
                                onClick={() => setShowModel(!showModel)}
                            >
                                <FaTimes />
                            </button>
                            <div>
                                <div>
                                    <h1 className="font-bold text-2xl">
                                        Question
                                    </h1>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: question.question,
                                        }}
                                    ></div>
                                </div>
                                <div>
                                    <h1 className="font-bold text-2xl">
                                        Correct Answer
                                    </h1>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: question.correct_answer,
                                        }}
                                    ></div>
                                    <h1 className="font-bold text-2xl">Options</h1>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: question.option_a,
                                        }}
                                    ></div>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: question.option_a,
                                        }}
                                    ></div>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: question.option_a,
                                        }}
                                    ></div>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: question.option_a,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        "loading"
                    )}
                </Model>
            )}
        </div>
    );
};

export default CourseQuestions;
