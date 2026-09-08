import { useState, useSyncExternalStore } from "react";
import TimerCard from "./TimerCard";
import CircularSlider from "./CircularSlider";
import {
  readMindfulMinutes,
  subscribeMindfulMinutes,
} from "@/lib/mindfulMinutes";
import styles from "./DurationPicker.module.css";

interface DurationPickerProps {
  onStart: (minutes: number) => void;
}

export default function DurationPicker({ onStart }: DurationPickerProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(10);
  const totalMinutes = useSyncExternalStore(
    subscribeMindfulMinutes,
    readMindfulMinutes,
    () => 0,
  );

  return (
    <>
      <h1 className={styles.title}>Gong-y</h1>
      <p className={styles.subtitle}>Choose your quiet interval</p>

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
        Start timer
      </button>

      <p className={styles.hint} aria-label="Timer controls">
        Gongs at the start, one third, and 10 seconds before the end.
      </p>

      <div className={styles.grid}>
        <TimerCard minutes={10} onClick={onStart} />
        <TimerCard minutes={30} onClick={onStart} />
        <TimerCard minutes={60} onClick={onStart} />
      </div>

      {totalMinutes !== null && totalMinutes > 0 && (
        <div className={styles.stats}>Mindful minutes: {totalMinutes}</div>
      )}
    </>
  );
}
