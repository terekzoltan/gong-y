import { useEffect } from "react";
import { useGongTimer } from "@/hooks/useGongTimer";
import styles from "./ActiveTimer.module.css";

interface ActiveTimerProps {
    minutes: number;
    onCancel: () => void;
}

export default function ActiveTimer({ minutes, onCancel }: ActiveTimerProps) {
    const { displayTime, isRunning, startTimer, stopTimer, pause, resume, setTimeSeconds, totalSeconds, initialDurationSeconds } = useGongTimer({
        initialDurationMinutes: minutes,
        onFinish: () => {
            // Keep visible when finished
        }
    });

    useEffect(() => {
        startTimer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Slider: min=0 (start), max=initialDurationSeconds (end)
    // value = elapsed time (starts at 0, goes to max)
    const elapsedSeconds = initialDurationSeconds - totalSeconds;

    return (
        <div className={styles.container}>
            <div className={styles.timerDisplay}>
                {displayTime}
            </div>

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
                    }}
                />
            </div>

            <div className={styles.buttonGroup}>
                <button
                    className={styles.pauseButton}
                    onClick={isRunning ? pause : resume}
                >
                    {isRunning ? "Pause" : "Resume"}
                </button>
                <button className={styles.cancelButton} onClick={onCancel}>
                    Stop
                </button>
            </div>
        </div>
    );
}
