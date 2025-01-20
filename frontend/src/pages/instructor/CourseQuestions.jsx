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
    const { userId,courseId,examId } = useParams();
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
                    <div className="sticky top-0 bg-white shadow-sm z-10 p-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                    {course && course.title}
                                </h1>
                                <p className="text-gray-600">
                                    Manage and review exam questions
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Link
                                    to={`/exams/${userId}/${course?.id}`}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center gap-2"
                                >
                                    <i className="fas fa-arrow-left"></i>
                                    <span>Back to Exams</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-10 gap-3">
                                {questions && questions.map((q) => (
                                    <div key={q.id} className="relative">
                                        {!q.question ? (
                                            <Link
                                                to={`/add-question/${q.id}/${userId}/${courseId}/${examId}`}
                                                className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
                                            >
                                                <span className="text-gray-600 hover:text-blue-600 font-medium">
                                                    {q.serial_number}
                                                </span>
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => showQuestionDetail(q.id)}
                                                className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                                            >
                                                {q.serial_number}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showModel && (
                <Model>
                    {question ? (
                        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-xl font-bold text-gray-900">Question Details</h2>
                                <button 
                                    onClick={() => setShowModel(!showModel)}
                                    className="text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Question</h3>
                                        <div 
                                            className="p-4 bg-gray-50 rounded-lg text-gray-800"
                                            dangerouslySetInnerHTML={{__html: question.question}}
                                        />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Correct Answer</h3>
                                        <div 
                                            className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-800"
                                            dangerouslySetInnerHTML={{__html: question.correct_answer}}
                                        />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Options</h3>
                                        <div className="space-y-2">
                                            {['a', 'b', 'c', 'd'].map((option) => (
                                                <div
                                                    key={option}
                                                    className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-800"
                                                    dangerouslySetInnerHTML={{__html: question[`option_${option}`]}}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end p-4 border-t">
                                <Link
                                    to={`/edit-question/${userId}/${question.id}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    <FaPenToSquare className="w-4 h-4" />
                                    <span>Edit Question</span>
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
