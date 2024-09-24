import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import "../../quill.css";
import { FaPlus } from "react-icons/fa6";
import Sidebar from "../../components/Sidebar";
import { Link } from "react-router-dom";
import Header from "../../components/Header";

const AddQuestion = () => {
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

    // State to hold the content of each editor
    const [editor1Content, setEditor1Content] = useState("");
    const [editor2Content, setEditor2Content] = useState("");
    const [editor3Content, setEditor3Content] = useState("");
    const [options, setOptions] = useState([]);

    // Handle changes for each editor
    const handleEditor1Change = (content) => {
        setEditor1Content(content);
    };

    const handleEditor2Change = (content) => {
        setEditor2Content(content);
    };

    const handleEditor3Change = (content) => {
        setEditor3Content(content);
    };

    const addOption = () => {
        setOptions((prev) => [...prev, editor3Content]);
        setEditor3Content('')
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
                    <div className="mb-5">
                        <h2 className="font-bold text-xl my-2">Question</h2>
                        <ReactQuill
                            value={editor1Content}
                            onChange={handleEditor1Change}
                            theme="snow"
                            modules={modules}
                        />
                    </div>
                    <div className="mb-5">
                        <h2 className="font-bold text-xl my-2">
                            Correct Answer
                        </h2>
                        <ReactQuill
                            value={editor2Content}
                            onChange={handleEditor2Change}
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
                            value={editor3Content}
                            onChange={handleEditor3Change}
                            theme="snow"
                            modules={modules}
                        />
                    </div>
                    <button className="bg-black text-white w-full my-5 py-3 text-xl ">
                        Add
                    </button>
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
                <div className="bg-white  p-2 min-h-36 flex flex-col gap-5">
                    <div>
                        <h1>Correct Answer</h1>
                    </div>
                    <div>
                        <div>
                            <h1 className="font-bold text-xl">Options</h1>
                            <p>List of Added Options</p>
                            <div className="my-4">
                                {options &&
                                    options.map((option,i) => (
                                        <div key={i} className="my-2">
                                            <div
                                                className="bg-primary-color capitalize p-2"
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
