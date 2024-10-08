import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import useFetch from "../hooks/useFetch";
import { path } from "../../utils/path";
import axios from "axios";
import { useParams } from "react-router-dom";

const Student = () => {
    const {studentId}= useParams()
    const {data,loading,err} = useFetch(`/get-exam`)
    const {data:student,loading:stdLoading,err:stdErr} = useFetch(`/get-student/${studentId}`)
    console.log(student)

    const [course, setCourse] = useState()

    useEffect(() =>{
        const fetch = async ()=>{
            try {
                const res = await axios(`${path}/get-course/${data.exam.course_id}`)
                setCourse(res.data)
                console.log(course)
            } catch (err) {
               console.log(err) 
            }
        }
        fetch()
    },[data])

    const [activeButton, setActiveButton] = useState(null); // State to track the active button
    const [clickedBtns, setClickedBtns] = useState([]);
    const [showModel, setShowModel] = useState(false)

    const [timeRemaining, setTimeRemaining] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });


    const targetDate = new Date("2024-12-31T23:11:59").getTime();
    // const date = new Date() 
    // const time = date.setMinutes(60)  
    // const targetDate = new Date(time).getTime()

    // useEffect(() => {
    //     // Update the timer every second
    //     const interval = setInterval(() => {
    //         const now = new Date();
    //         const difference = targetDate - now;

    //         if (difference <= 0) {
    //             clearInterval(interval);
    //             setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
    //         } else {
    //             const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    //             const minutes = Math.floor((difference / 1000 / 60) % 60);
    //             const seconds = Math.floor((difference / 1000) % 60);

    //             setTimeRemaining({ hours, minutes, seconds });
    //         }
    //     }, 1000);

    //     // Clean up the interval on component unmount
    //     return () => clearInterval(interval);
    // }, []);

    const handleClick = (index) => {
        setActiveButton(index); // Update the active button index on click
        if (!clickedBtns.includes(index)) {
            setClickedBtns((prev) => [...prev, index]);
        }

        console.log(clickedBtns);
    };

    return (
        <div class="grid grid-cols-6 gap-4 min-h-screen">
            <Sidebar />
            <div class="col-start-2  col-end-7 ">
                <div class="divide-y-2  p-4">
                    <div class="flex items-center justify-between capitalize py-4">
                        <h1 class="">
                            {student && student.full_name}
                            <span class="block">{student.candidate_no}</span>
                        </h1>
                        <div>
                            <button
                                type="button"
                                class="bg-black text-white p-2 font-bold"
                            >
                                {`${timeRemaining.hours}h : ${timeRemaining.minutes}m : ${timeRemaining.seconds}s`}
                            </button>
                        </div>
                    </div>

                    <div>
                        <div class="">
                            <div class="my-4">
                                <h1 class="font-bold text-2xl">{}</h1>
                                <p>Date: Jan 20, 2024</p>
                            </div>
                            <div class="bg-white/75 p-4">
                                <h3 class="font-poppins font-bold my-2">
                                    Question 5
                                </h3>
                                <p>
                                    Discuss the role of nonverbal communication
                                    in public speaking. How can a speaker
                                    effectively use body language, facial
                                    expressions, and eye contact to enhance
                                    their message
                                </p>
                                <div class="my-5">
                                    <div class="flex items-center my-3  gap-5 w-[35rem] hover:bg-primary-color/25 cursor-pointer">
                                        <button
                                            type="btn"
                                            class="bg-primary-color px-2 rounded-full text-xl"
                                        >
                                            a
                                        </button>
                                        <p>
                                            Nonverbal communication has no
                                            impact on public speaking; only the
                                            spoken words matter.
                                        </p>
                                    </div>
                                    <div class="flex items-center my-3 gap-5 w-[35rem] hover:bg-primary-color/25 cursor-pointer">
                                        <button
                                            type="btn"
                                            class="bg-primary-color px-2 rounded-full text-xl"
                                        >
                                            a
                                        </button>
                                        <p>
                                            Nonverbal communication has no
                                            impact on public speaking; only the
                                            spoken words matter.
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-5 w-[35rem] hover:bg-primary-color/25 cursor-pointer">
                                        <button
                                            type="btn"
                                            class="bg-primary-color px-2 rounded-full text-xl"
                                        >
                                            a
                                        </button>
                                        <p>
                                            Nonverbal communication has no
                                            impact on public speaking; only the
                                            spoken words matter.
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-5 my-3 w-[35rem] hover:bg-primary-color/25 cursor-pointer">
                                        <button
                                            type="btn"
                                            class="bg-primary-color px-2 rounded-full text-xl"
                                        >
                                            a
                                        </button>
                                        <p>
                                            Nonverbal communication has no
                                            impact on public speaking; only the
                                            spoken words matter.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex justify-center my-5 gap-5">
                    <button class="capitalize bg-black text-white px-4 py-2">
                        previous
                    </button>
                    <button class="capitalize bg-black text-white px-4 py-2">
                        Next
                    </button>
                </div>
                <div class="bg-white p-4 mr-4">
                    <div className="grid grid-cols-[repeat(20,1fr)] gap-5">
                        {data&& data.questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleClick(index)} // Update state on button click
                                className={`bg-primary-color rounded-full hover:bg-black hover:text-white 
                        ${
                            activeButton === index
                                ? "text-white bg-green-600 font-bold text-xl"
                                : ""
                        } ${
                                    clickedBtns.includes(index)
                                        ? "bg-red-500"
                                        : ""
                                } `} // Conditionally change the class if active
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
                <div class="my-3 flex justify-center">
                    <button class="px-14 py-2 bg-black text-white">
                        Submit
                    </button>
                </div>
            </div>
            {showModel && <div className="absolute bg-black">
                
                </div>}
        </div>
    );
};

export default Student;
