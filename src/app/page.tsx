"use client";

import { useState } from "react";
import TimerCard from "@/components/TimerCard";
import ActiveTimer from "@/components/ActiveTimer";
import styles from "./page.module.css";

export default function Home() {
    const [activeMinutes, setActiveMinutes] = useState<number | null>(null);
    const [selectedMinutes, setSelectedMinutes] = useState<number>(10);

    const handleStart = (minutes: number) => {
        setActiveMinutes(minutes);
    };

    const handleCancel = () => {
        setActiveMinutes(null);
        setSelectedMinutes(10); // Reset slider value on cancel
    };

    return (
        <main className={styles.main}>
            {activeMinutes ? (
                <ActiveTimer minutes={activeMinutes} onCancel={handleCancel} />
            ) : (
                <>
                    <h1 className={styles.title}>Gong-y</h1>
                    <p className={styles.subtitle}>Select duration</p>

                    <div className={styles.sliderContainer}>
                        <input
                            type="range"
                            min="1"
                            max="90"
                            value={selectedMinutes} // Use value prop for controlled component
                            className={styles.slider}
                            onChange={(e) => setSelectedMinutes(Number(e.target.value))}
                        />
                        <div className={styles.sliderValue}>{selectedMinutes} min</div>
                    </div>
                    <button
                        className={styles.startButton}
                        onClick={() => handleStart(selectedMinutes)}
                    >
                        Start
                    </button>

                    <div className={styles.grid}>
                        <TimerCard minutes={10} onClick={handleStart} />
                        <TimerCard minutes={30} onClick={handleStart} />
                        <TimerCard minutes={60} onClick={handleStart} />
                    </div>
                </>
            )}
        </main>
    );
}
