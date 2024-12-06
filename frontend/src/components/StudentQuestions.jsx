import React from "react";

const StudentQuestions = ({data}) => {
    return (
        <div class="bg-white/60 p-4">
            {data &&
                data.questions.map((question, index) => {
                    if (index == questionIndexToShow) {
                        return (
                            <div>
                                <h3 class="font-poppins font-bold my-2">
                                    <span>Question: </span>
                                    {index + 1}
                                </h3>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: question.question,
                                    }}
                                />
                                <div>
                                    <div
                                        onClick={() =>
                                            handleAnswer(
                                                "correct_answer",
                                                question.id,
                                                question.question,
                                                question.correct_answer
                                            )
                                        }
                                        class={`${getDivStyle(
                                            question.correct_answer
                                        )}} flex items-center gap-5 w-[35rem] hover:bg-gray-500/50 cursor-pointer my-4 p-2`}
                                    >
                                        <button
                                            type="btn"
                                            class="bg-primary-color px-2 rounded-full text-xl"
                                            onClick={() => {}}
                                        >
                                            a
                                        </button>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                // __html: question.option_a,
                                                __html: question.correct_answer,
                                            }}
                                        ></div>
                                    </div>
                                    <div
                                        onClick={() => {
                                            handleAnswer(
                                                "option_b",
                                                question.id,
                                                question.question,
                                                question.option_b
                                            );
                                        }}
                                        class={`${getDivStyle(
                                            question.option_b
                                        )}} flex items-center gap-5 w-[35rem] hover:bg-gray-500/50 cursor-pointer my-4 p-2`}
                                    >
                                        <button
                                            type="btn"
                                            class="bg-primary-color px-2 rounded-full text-xl"
                                        >
                                            b
                                        </button>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: question.option_b,
                                            }}
                                        ></div>
                                    </div>
                                    <div
                                        onClick={() =>
                                            handleAnswer(
                                                "option_c",
                                                question.id,
                                                question.question,
                                                question.option_c
                                            )
                                        }
                                        class={`${getDivStyle(
                                            question.option_c
                                        )}} flex items-center gap-5 w-[35rem] hover:bg-gray-500/50 cursor-pointer my-4 p-2`}
                                    >
                                        <button
                                            type="btn"
                                            class="bg-primary-color px-2 rounded-full text-xl"
                                        >
                                            c
                                        </button>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: question.option_c,
                                            }}
                                        ></div>
                                    </div>
                                    <div
                                        onClick={() =>
                                            handleAnswer(
                                                "option_c",
                                                question.id,
                                                question.question,
                                                question.option_d
                                            )
                                        }
                                        class={`${getDivStyle(
                                            question.option_d
                                        )}} flex items-center gap-5 w-[35rem] hover:bg-gray-500/50 cursor-pointer my-4 p-2`}
                                    >
                                        <button
                                            type="btn"
                                            class="bg-primary-color px-2 rounded-full text-xl"
                                        >
                                            d
                                        </button>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: question.option_d,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div class="flex justify-center my-5 gap-5">
                                    <button
                                        onClick={handlePrev}
                                        class="capitalize bg-black text-white px-4 py-2"
                                    >
                                        previous
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleNext(
                                                question.id,
                                                question.question
                                            )
                                        }
                                        class="capitalize bg-black text-white px-4 py-2"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        );
                    }
                })}
        </div>
    );
};

export default StudentQuestions;
