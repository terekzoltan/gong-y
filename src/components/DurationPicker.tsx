import { useState, useEffect } from "react";
import TimerCard from "./TimerCard";
import CircularSlider from "./CircularSlider";
import styles from "../app/page.module.css";

interface DurationPickerProps {
    onStart: (minutes: number) => void;
}

export default function DurationPicker({ onStart }: DurationPickerProps) {
    const [selectedMinutes, setSelectedMinutes] = useState<number>(10);
    const [totalMinutes, setTotalMinutes] = useState<number | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("gongy_total_minutes");
        if (stored) {
            setTotalMinutes(parseInt(stored, 10));
        }
    }, []);

    return (
        <>
            <h1 className={styles.title}>Gong-y</h1>
            <p className={styles.subtitle}>Select duration</p>

            <CircularSlider
                min={1}
                max={90}
                value={selectedMinutes}
                onChange={setSelectedMinutes}
            />

            <button
                className={styles.startButton}
                onClick={() => onStart(selectedMinutes)}
            >
                Start
            </button>

            <div className={styles.grid}>
                <TimerCard minutes={10} onClick={onStart} />
                <TimerCard minutes={30} onClick={onStart} />
                <TimerCard minutes={60} onClick={onStart} />
            </div>

            {totalMinutes !== null && totalMinutes > 0 && (
                <div style={{ marginTop: '4rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', letterSpacing: '1px' }}>
                    Mindful minutes: {totalMinutes}
                </div>
            )}
        </>
    );
}
