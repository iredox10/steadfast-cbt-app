import React from "react";

const StudentQuestion = ({questions}) => {
    return (
        <div class="bg-white/75 p-4">
            {data &&
                data.questions.map((question, index) => {
                    if (index == questionIndexToShow) {
                        return (
                            <div>
                                <h3 class="font-poppins font-bold my-2">
                                    {question.serialNumber}
                                </h3>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: question.question,
                                    }}
                                />
                                <div>
                                    <div
                                        onClick={(e) =>
                                            handleAnswer(
                                                "option_a",
                                                question.id,
                                                question.question,
                                                question.option_a
                                            )
                                        }
                                        class={`${getDivStyle(
                                            question.option_a
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
                                                __html: question.option_a,
                                            }}
                                        ></div>
                                    </div>
                                    <div
                                        onClick={(e) => {
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
                                        onClick={(e) =>
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
                                        onClick={(e) =>
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
                            </div>
                        );
                    }
                })}
        </div>
    );
};

export default StudentQuestion;
