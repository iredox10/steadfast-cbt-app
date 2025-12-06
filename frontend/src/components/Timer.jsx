import React, { useState, useEffect } from "react";

const Timer = ({ initialTime, startTime, onTimeUp }) => {
    const [timeRemaining, setTimeRemaining] = useState(() => {
        // If we have a server-side start time, calculate remaining time based on it
        // This is the most robust method as it persists across devices and cache clears
        if (startTime) {
            const startTimestamp = new Date(startTime).getTime();
            const totalDurationInSeconds = initialTime * 60;
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - startTimestamp) / 1000);
            const remaining = totalDurationInSeconds - elapsedSeconds;
            
            console.log("Timer sync with server:", {
                start: startTime,
                total: totalDurationInSeconds,
                elapsed: elapsedSeconds,
                remaining: remaining
            });

            // Save to local storage just for the interval tick backup
            localStorage.setItem("examTimeRemaining", remaining.toString());
            localStorage.setItem("examTotalTime", totalDurationInSeconds.toString());
            
            return Math.max(0, remaining);
        }

        // Fallback to localStorage logic (legacy)
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
                
                localStorage.setItem("examTotalTime", currentTotalTimeInSeconds.toString());
                localStorage.setItem("examTimeRemaining", newTimeRemaining.toString());
                
                return newTimeRemaining;
            }
            
            return parsedSavedTime;
        }
        
        const initialTimeInSeconds = initialTime * 60;
        localStorage.setItem("examTotalTime", initialTimeInSeconds.toString());
        return initialTimeInSeconds;
    });

    const [isActive, setIsActive] = useState(true);

    // Handle time extension (initialTime changes)
    useEffect(() => {
        if (startTime) {
            // Recalculate based on static start time and new duration
            const startTimestamp = new Date(startTime).getTime();
            const totalDurationInSeconds = initialTime * 60;
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - startTimestamp) / 1000);
            const newRemaining = Math.max(0, totalDurationInSeconds - elapsedSeconds);
            
            setTimeRemaining(newRemaining);
            localStorage.setItem("examTimeRemaining", newRemaining.toString());
            localStorage.setItem("examTotalTime", totalDurationInSeconds.toString());
        } else {
            // Legacy localStorage update logic
            const currentTotalTimeInSeconds = initialTime * 60;
            const savedTotalTime = localStorage.getItem("examTotalTime");
            
            if (savedTotalTime && currentTotalTimeInSeconds > parseInt(savedTotalTime)) {
                const timeExtension = currentTotalTimeInSeconds - parseInt(savedTotalTime);
                setTimeRemaining(prevTime => {
                    const newTime = prevTime + timeExtension;
                    localStorage.setItem("examTimeRemaining", newTime.toString());
                    localStorage.setItem("examTotalTime", currentTotalTimeInSeconds.toString());
                    return newTime;
                });
            }
        }
    }, [initialTime, startTime]);

    useEffect(() => {
        // Sync with server start time on mount if available to correct any drift
        if (startTime) {
            const startTimestamp = new Date(startTime).getTime();
            const totalDurationInSeconds = initialTime * 60;
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - startTimestamp) / 1000);
            const correctRemaining = Math.max(0, totalDurationInSeconds - elapsedSeconds);
            
            // Only update if significant drift (> 5 seconds) to avoid jitter
            if (Math.abs(correctRemaining - timeRemaining) > 5) {
                setTimeRemaining(correctRemaining);
            }
        }

        const interval = setInterval(() => {
            setTimeRemaining((prevTime) => {
                // If using server time, we could recalculate 'now - start' every tick, 
                // but decrementing is smoother UI. We rely on useEffect dependencies to re-sync if props change.
                const newTime = prevTime - 1;

                // Save current time to localStorage as backup
                localStorage.setItem("examTimeRemaining", newTime.toString());
                localStorage.setItem("examLastTimestamp", Date.now().toString());

                if (newTime <= 0) {
                    clearInterval(interval);
                    setIsActive(false);
                    onTimeUp(true);
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
    }, [initialTime, startTime, onTimeUp]);

    // ... existing formatTime and return ...

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
