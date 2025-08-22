import React, { useState, useEffect } from "react";

const Timer = ({ initialTime, onTimeUp }) => {
    const [timeRemaining, setTimeRemaining] = useState(() => {
        // Try to get saved time from localStorage
        const savedTime = localStorage.getItem("examTimeRemaining");
        const savedTotalTime = localStorage.getItem("examTotalTime");
        
        if (savedTime && savedTotalTime) {
            const parsedSavedTime = parseInt(savedTime);
            const parsedSavedTotalTime = parseInt(savedTotalTime);
            const currentTotalTimeInSeconds = initialTime * 60;
            
            // If the total time has increased (time extension), add the difference
            if (currentTotalTimeInSeconds > parsedSavedTotalTime) {
                const timeExtension = currentTotalTimeInSeconds - parsedSavedTotalTime;
                const newTimeRemaining = parsedSavedTime + timeExtension;
                console.log(`Time extended: +${timeExtension}s, new time: ${newTimeRemaining}s`);
                
                // Save the new total time
                localStorage.setItem("examTotalTime", currentTotalTimeInSeconds.toString());
                localStorage.setItem("examTimeRemaining", newTimeRemaining.toString());
                
                return newTimeRemaining;
            }
            
            // Use saved time if it's valid
            return parsedSavedTime;
        }
        
        // Convert initial time from minutes to seconds
        const initialTimeInSeconds = initialTime * 60;
        localStorage.setItem("examTotalTime", initialTimeInSeconds.toString());
        return initialTimeInSeconds;
    });

    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        // Update saved total time if initialTime changes
        const currentTotalTimeInSeconds = initialTime * 60;
        const savedTotalTime = localStorage.getItem("examTotalTime");
        
        if (savedTotalTime && currentTotalTimeInSeconds > parseInt(savedTotalTime)) {
            const timeExtension = currentTotalTimeInSeconds - parseInt(savedTotalTime);
            console.log(`Detected time extension: +${timeExtension}s`);
            
            setTimeRemaining(prevTime => {
                const newTime = prevTime + timeExtension;
                localStorage.setItem("examTimeRemaining", newTime.toString());
                localStorage.setItem("examTotalTime", currentTotalTimeInSeconds.toString());
                return newTime;
            });
        }
    }, [initialTime]);

    useEffect(() => {
        // Get the timestamp when timer was last updated
        const lastTimestamp = localStorage.getItem("examLastTimestamp");
        const now = Date.now();

        if (lastTimestamp) {
            // Calculate time passed since last update
            const timePassed = Math.floor(
                (now - parseInt(lastTimestamp)) / 1000
            );
            const newTimeRemaining = timeRemaining - timePassed;

            // Update timer if time has passed
            if (newTimeRemaining < timeRemaining) {
                setTimeRemaining(Math.max(0, newTimeRemaining));
            }
        }

        // Save initial timestamp
        localStorage.setItem("examLastTimestamp", now.toString());

        const interval = setInterval(() => {
            setTimeRemaining((prevTime) => {
                const newTime = prevTime - 1;

                // Save current time to localStorage
                localStorage.setItem("examTimeRemaining", newTime.toString());
                localStorage.setItem(
                    "examLastTimestamp",
                    Date.now().toString()
                );

                if (newTime <= 0) {
                    clearInterval(interval);
                    setIsActive(false);
                    onTimeUp(true); // Pass true to indicate auto-submission
                    // Clear localStorage
                    localStorage.removeItem("examTimeRemaining");
                    localStorage.removeItem("examLastTimestamp");
                    localStorage.removeItem("examTotalTime");
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [initialTime, onTimeUp]);

    // Format time as HH:MM:SS
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const pad = (num) => num.toString().padStart(2, "0");

        return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
    };

    return (
        <div
            className={`font-mono text-lg bg-black p-2 rounded-xl text-white ${
                timeRemaining < 300 ? "bg-red-400 text-white" : "text-gray-800"
            }`}
        >
            {formatTime(timeRemaining)}
        </div>
    );
};

export default Timer;
