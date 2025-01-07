import React, { useState, useEffect } from "react";

const Timer = ({ initialTime, onTimeUp, reminder }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    
    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp(true); // Pass true to indicate auto-submission
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

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

    // Add warning class when time is running low (less than 5 minutes)
    const timerClassName = `px-2 py-1 rounded-md text-white text-lg ${
        timeLeft <= 300 ? 'bg-red-600' : 'bg-gray-800'
    }`;

    return (
        <div className={timerClassName}>
            {String(displayMinutes).padStart(2, "0")}
            <span className="text-gray-400 text-sm">m</span>
            <span className="text-gray-400 mx-0.5">:</span>
            {String(displaySeconds).padStart(2, "0")}
            <span className="text-gray-400 text-sm">s</span>
        </div>
    );
};

export default Timer;
