import React, { useState } from "react";

const QuestionComponent = ({ question }) => {
    // State to track the selected option for this question
    const [selectedOption, setSelectedOption] = useState(null);

    // Handle answer selection
    const handleAnswer = (e, option) => {
        e.preventDefault();
        setSelectedOption(option); // Update the selected option
        console.log(`Selected Option: ${option}`);
    };

    // Determine div styles dynamically
    const getDivStyle = (option) =>
        selectedOption === option ? "bg-green-500" : "hover:bg-gray-500/50";

    return (
        <div>
            <h3 className="font-poppins font-bold my-2">
                {question.serialNumber}
            </h3>
            <div
                dangerouslySetInnerHTML={{
                    __html: question.question,
                }}
            />
            <div>
                {["a", "b", "c", "d"].map((optionKey) => (
                    <div
                        key={optionKey}
                        onClick={(e) =>
                            handleAnswer(e, question[`option_${optionKey}`])
                        }
                        className={`flex items-center gap-5 w-[35rem] cursor-pointer my-4 p-2 ${getDivStyle(question[`option_${optionKey}`])}`}
                    >
                        <button
                            type="button"
                            className="bg-primary-color px-2 rounded-full text-xl"
                        >
                            {optionKey}
                        </button>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: question[`option_${optionKey}`],
                            }}
                        ></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionComponent;
