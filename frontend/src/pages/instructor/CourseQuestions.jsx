import { FaEye, FaPenToSquare } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

const CourseQuestions = () => {
    return (
        <div class="grid grid-cols-6 h-screen">
            <Sidebar />
            <div className="col-start-2 col-end-7 p-5">
                <div>
                    <Header title={"Course Name"} subtitle={"Instructor"} />
                    <div className="flex flex-col gap-5 relative">
                        <Link
                            to="/add-question"
                            className="bg-black text-white p-2 capitalize absolute -bottom-0 right-0"
                        >
                            add question
                        </Link>
                        <div className="grid grid-cols-2 gap-5">
                            {[...Array(6)].map((i, question) =>(
                                <div id="questionsWrapper">
                                    <div class="bg-white/70 p-5">
                                        <p class="my-2">
                                            Discuss the role of nonverbal
                                            communication in public speaking.
                                            How can a speaker effectively use
                                            body language, facial expressions,
                                            and eye contact to enhance their
                                            message
                                        </p>

                                        <div class="flex justify-end gap-5">
                                            <button id="view-question">
                                                <FaEye />
                                            </button>
                                            <button id="edit-question">
                                                <FaPenToSquare />
                                            </button>
                                        </div>
                                    </div>
                                    
                                </div>
                            ))}
                            
                        </div>
                        <div className="flex justify-center">

                            <button>1 2 3 4 5</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseQuestions;
