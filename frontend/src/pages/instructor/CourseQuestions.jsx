import { FaEye, FaPenToSquare } from "react-icons/fa6";
import { Link, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import useFetch from "../../hooks/useFetch";
import { useEffect, useState } from "react";
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

    const {
        data: exam,
        loading: examLoading,
        err: errLoading,
    } = useFetch(`/get-exam-by-id/${examId}`);

    const {
        data: user,
        loading: userLoading,
        err: userErr,
    } = useFetch(`/get-user/${userId}`);

    console.log(exam, user);

    const [course, setCourse] = useState();
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios(`${path}/get-course/${exam.course_id}`);
                setCourse(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetch();
    }, [exam]);
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
                        <Header
                            title={`${course && course.title}`}
                            subtitle={"List of Question"}
                        />
                    </div>
                    <div className="flex flex-col gap-5 relative">
                        <div className="">
                            {loading && <p>loading...</p>}
                            <div className="flex gap-5 flex-wrap w-full">
                                {questions &&
                                    questions.map((q) => (
                                        <div
                                            key={q.id}
                                            className={`p-4 rounded-full  text-center ${
                                                q.question
                                                    ? "bg-green-500"
                                                    : "bg-white"
                                            }`}
                                        >
                                            {!q.question ? (
                                                <Link
                                                    to={`/add-question/${q.id}/${userId}/${examId}`}
                                                >
                                                    {q.serial_number}
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        showQuestionDetail(q.id)
                                                    }
                                                >
                                                    {q.serial_number}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModel && (
                <Model>
                    {question ? (
                        <div className="p-5 relative">
                            <button
                                className="absolute top-4 right-4 bg-black rounded-full text-white p-1"
                                onClick={() => setShowModel(!showModel)}
                            >
                                <FaTimes />
                            </button>
                            <div className="my-5">
                                <div>
                                    <h1 className="font-bold text-xl my-2">
                                        Question
                                    </h1>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: question.question,
                                        }}
                                        className="my-2"
                                    ></div>
                                </div>
                                <div>
                                    <h1 className="font-bold text-xl ">
                                        Correct Answer
                                    </h1>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: question.correct_answer,
                                        }}
                                    ></div>
                                    <h1 className="font-bold text-xl my-2">
                                        Options
                                    </h1>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: question.option_a,
                                        }}
                                    ></div>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: question.option_b,
                                        }}
                                    ></div>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: question.option_c,
                                        }}
                                    ></div>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: question.option_d,
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <div className="flex justify-end text-xl">
                                <Link
                                    to={`/edit-question/${userId}/${question.id}`}
                                >
                                    <FaPenToSquare />
                                </Link>
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
