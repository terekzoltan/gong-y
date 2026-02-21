import { useEffect, useState, useRef } from "react";
import { useGongTimer } from "@/hooks/useGongTimer";
import styles from "./ActiveTimer.module.css";

interface ActiveTimerProps {
    minutes: number;
    onCancel: () => void;
}

export default function ActiveTimer({ minutes, onCancel }: ActiveTimerProps) {
    const [isWarmingUp, setIsWarmingUp] = useState(true);
    const [warmUpSeconds, setWarmUpSeconds] = useState(5);
    const [isActive, setIsActive] = useState(true);
    const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { displayTime, isRunning, startTimer, stopTimer, pause, resume, setTimeSeconds, totalSeconds, initialDurationSeconds } = useGongTimer({
        initialDurationMinutes: minutes,
        onFinish: () => {
            // Keep visible when finished
            setIsActive(true); // Ensure controls are visible when finished
        }
    });

    // Handle inactivity for Zen Mode
    const resetInactivityTimeout = () => {
        setIsActive(true);
        if (inactivityTimeoutRef.current) {
            clearTimeout(inactivityTimeoutRef.current);
        }
        // Only hide controls if timer is running and warm-up is over
        if (isRunning && !isWarmingUp) {
            inactivityTimeoutRef.current = setTimeout(() => {
                setIsActive(false);
            }, 3000);
        }
    };

    useEffect(() => {
        // Global listeners for activity
        window.addEventListener("mousemove", resetInactivityTimeout);
        window.addEventListener("touchstart", resetInactivityTimeout);
        window.addEventListener("click", resetInactivityTimeout);
        window.addEventListener("keydown", resetInactivityTimeout);

        // Initial setup
        resetInactivityTimeout();

        return () => {
            window.removeEventListener("mousemove", resetInactivityTimeout);
            window.removeEventListener("touchstart", resetInactivityTimeout);
            window.removeEventListener("click", resetInactivityTimeout);
            window.removeEventListener("keydown", resetInactivityTimeout);
            if (inactivityTimeoutRef.current) {
                clearTimeout(inactivityTimeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning, isWarmingUp]);

    // Handle Warm-up Countdown
    useEffect(() => {
        if (warmUpSeconds > 0) {
            const timer = setTimeout(() => setWarmUpSeconds(s => s - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isWarmingUp) {
            setIsWarmingUp(false);
            startTimer();
        }
    }, [warmUpSeconds, isWarmingUp, startTimer]);

    // Slider: min=0 (start), max=initialDurationSeconds (end)
    // value = elapsed time (starts at 0, goes to max)
    const elapsedSeconds = initialDurationSeconds - totalSeconds;

    // Calculate progress percentage for dynamic background
    const progress = totalSeconds <= 0 ? 1 : elapsedSeconds / initialDurationSeconds;

    if (isWarmingUp) {
        return (
            <div className={styles.container}>
                <div className={styles.warmUpText}>Get ready...</div>
                <div className={styles.timerDisplay}>
                    {warmUpSeconds}
                </div>
                <button className={styles.cancelButton} onClick={onCancel} style={{ marginTop: '2rem' }}>
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <div
            className={styles.container}
            style={{
                background: `radial-gradient(circle at center, rgba(187, 134, 252, ${0.05 + progress * 0.15}) 0%, transparent 70%)`
            }}
        >
            <div className={`${styles.timerDisplay} ${!isActive ? styles.zenModeText : ''}`}>
                {displayTime}
            </div>

            <div className={`${styles.controlsWrapper} ${isActive ? styles.visible : styles.hidden}`}>
                <div className={styles.controls}>
                    <input
                        type="range"
                        min="0"
                        max={initialDurationSeconds}
                        value={elapsedSeconds}
                        className={styles.slider}
                        onChange={(e) => {
                            const newElapsed = Number(e.target.value);
                            setTimeSeconds(initialDurationSeconds - newElapsed);
                            resetInactivityTimeout(); // Keep visible when interacting
                        }}
                    />
                </div>

                <div className={styles.buttonGroup}>
                    <button
                        className={styles.pauseButton}
                        onClick={() => {
                            isRunning ? pause() : resume();
                            resetInactivityTimeout();
                        }}
                    >
                        {isRunning ? "Pause" : "Resume"}
                    </button>
                    <button className={styles.cancelButton} onClick={onCancel}>
                        Stop
                    </button>
                </div>
            </div>
        </div>
    );
}
