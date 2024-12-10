import React, { useState, useEffect } from "react";

const Timer = ({ initialTime = 300, onTimeUp, reminder }) => {
    // Default to 5 minutes
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isActive, setIsActive] = useState(true);
    useEffect(() => {
        let timer = null;

        if (isActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
                reminder(timeLeft)
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(timer);
            onTimeUp(); // Call the function passed as prop when time is up
        }

        return () => clearInterval(timer); // Cleanup on unmount
    }, [isActive, timeLeft, onTimeUp]);

    const startTimer = () => {
        setIsActive(true);
    };

    const pauseTimer = () => {
        setIsActive(false);
    };

    const resetTimer = () => {
        setTimeLeft(initialTime);
        setIsActive(false);
    };

    // console.log(timeLeft)

    // Format time for display
    const displayMinutes = Math.floor(timeLeft / 60);
    const displaySeconds = timeLeft % 60;

    return (
        <div className="">
            <h1>
                {`${String(displayMinutes).padStart(2, "0")}m :${String(
                    displaySeconds
                ).padStart(2, "0")}s`}{" "}
                <span>left</span>
            </h1>
        </div>
    );
};

export default Timer;
