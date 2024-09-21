import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import "../../quill.css";
import { FaPlus } from "react-icons/fa6";

const AddQuestion = () => {
    // State to hold the content of each editor
    const [editor1Content, setEditor1Content] = useState("");
    const [editor2Content, setEditor2Content] = useState("");
    const [editor3Content, setEditor3Content] = useState("");

    // Handle changes for each editor
    const handleEditor1Change = (content) => {
        setEditor1Content(content);
    };

    const handleEditor2Change = (content) => {
        setEditor2Content(content);
    };

    const handleEditor3Change = (content) => {
        setEditor2Content(content);
    };
    return (
        <div>
            <div className="bg-white p-3">
                <div>
                    <h2 className="font-bold text-2xl my-2">Question</h2>
                    <ReactQuill
                        value={editor1Content}
                        onChange={handleEditor1Change}
                        theme="snow"
                    />
                </div>
                <div>
                    <h2 className="font-bold text-2xl my-2">Correct Answer</h2>
                    <ReactQuill
                        value={editor2Content}
                        onChange={handleEditor2Change}
                        theme="snow"
                    />
                </div>

                <div>
                    <h2 className="font-bold text-2xl my-2">Options</h2>
                    <button className="absolute right-10 bottom-1  bg-black text-white rounded-full p-3">
                        <FaPlus />
                    </button>
                    <ReactQuill
                        value={editor3Content}
                        onChange={handleEditor3Change}
                        theme="snow"
                    />
                </div>
                {/* <div>  
                <h3>Content from Editor 1:</h3>  
                <div dangerouslySetInnerHTML={{ __html: editor1Content }} />  
            </div>   */}
                {/* <div>  
                <h3>Content from Editor 2:</h3>  
                <div dangerouslySetInnerHTML={{ __html: editor2Content }} />  
            </div>   */}
            </div>{" "}
        </div>
    );
};

export default AddQuestion;

// import { useQuill } from "react-quilljs";
// import Sidebar from "../../components/Sidebar";
// import "quill/dist/quill.snow.css";
// import '../../quill.css'

// const AddQuestion = () => {
//     const { quill, quillRef } = useQuill();
//     return (
//         <div class="grid grid-cols-6 h-screen">
//             <Sidebar />
//             <div className=" col-start-2 col-end-7 p-5">
//                 <div>
//                     <h1>Course Name</h1>
//                     <p>Instructor Name</p>
//                 </div>
//                 <div>
//                     <div>
//                         <h1>Add Question</h1>
//                         <div>
//                             <label
//                                 htmlFor="question"
//                                 className="font-bold text-2xl"
//                             >
//                                 Question
//                             </label>
//                             <div>
//                                 <div ref={quillRef}></div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AddQuestion;
