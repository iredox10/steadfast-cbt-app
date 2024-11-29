import React, { useState, useEffect } from 'react';  

const Timer = ({ initialTime = 300, onTimeUp }) => { // Default to 5 minutes  
    const [timeLeft, setTimeLeft] = useState(initialTime);  
    const [isActive, setIsActive] = useState(true);  

    useEffect(() => {  
        let timer = null;  

        if (isActive && timeLeft > 0) {  
            timer = setInterval(() => {  
                setTimeLeft(prevTime => prevTime - 1);  
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

    // Format time for display  
    const displayMinutes = Math.floor(timeLeft / 60);  
    const displaySeconds = timeLeft % 60;  

    return (  
        <div>  
            <h1>{`${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`}</h1>  
        </div>  
    );  
};  

export default Timer;