import React, { useState, useEffect, useCallback } from "react";

const Timer = ({ initialTime, startTime, onTimeUp, remainingSecondsServer }) => {
    // Helper to calculate remaining time from server
    const calculateRemaining = useCallback(() => {
        // Priority 1: Direct remaining seconds from server (most accurate)
        if (remainingSecondsServer !== undefined && remainingSecondsServer !== null) {
            console.log("Timer: Using remainingSecondsServer", remainingSecondsServer);
            return remainingSecondsServer;
        }

        // Priority 2: Calculate from startTime (server-side start time)
        if (startTime) {
            const start = new Date(startTime);
            if (!isNaN(start.getTime())) {
                const startTimestamp = start.getTime();
                const totalDurationInSeconds = initialTime * 60;
                const now = Date.now();
                const elapsedSeconds = Math.floor((now - startTimestamp) / 1000);
                const remaining = totalDurationInSeconds - elapsedSeconds;
                
                console.log("Timer: Calculated from startTime", {
                    startTime,
                    elapsedSeconds,
                    remaining
                });
                return Math.max(0, remaining);
            }
        }

        // Priority 3: Fallback to base duration
        console.log("Timer: Fallback to initialTime", initialTime);
        return initialTime * 60;
    }, [initialTime, startTime, remainingSecondsServer]);

    const [timeRemaining, setTimeRemaining] = useState(calculateRemaining);
    const [isActive, setIsActive] = useState(true);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Sync state when props change (especially for extensions)
    useEffect(() => {
        const correctRemaining = calculateRemaining();
        
        // If we just got an extension, add it to current remaining or reset to calculated
        setTimeRemaining(correctRemaining);
        setHasInitialized(true);
        
        localStorage.setItem("examTimeRemaining", correctRemaining.toString());
        localStorage.setItem("examTotalTime", (initialTime * 60).toString());
    }, [calculateRemaining, initialTime, startTime, remainingSecondsServer]);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setTimeRemaining((prevTime) => {
                if (!hasInitialized) return prevTime;

                if (prevTime <= 0) {
                    console.log("Timer: REACHED ZERO");
                    clearInterval(interval);
                    setIsActive(false);
                    onTimeUp(true);
                    return 0;
                }

                const newTime = prevTime - 1;
                
                // Backup to localStorage every 5 seconds
                if (newTime % 5 === 0) {
                    localStorage.setItem("examTimeRemaining", newTime.toString());
                    localStorage.setItem("examLastTimestamp", Date.now().toString());
                }
                
                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [onTimeUp, isActive, hasInitialized]);

    // ... existing formatTime and return ...

    // Format time as HH:MM:SS
    const formatTime = (seconds) => {
        const totalSeconds = Math.max(0, Math.floor(seconds));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;

        const pad = (num) => num.toString().padStart(2, "0");

        return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
    };

    return (
        <div
            className={`font-mono text-lg bg-black p-2 rounded-xl text-white ${
                timeRemaining < 300 && hasInitialized ? "bg-red-600 animate-pulse" : ""
            }`}
        >
            {hasInitialized ? formatTime(timeRemaining) : "--:--:--"}
        </div>
    );
};

export default Timer;
