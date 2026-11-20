import { useState, useSyncExternalStore } from "react";
import TimerCard from "./TimerCard";
import CircularSlider from "./CircularSlider";
import type { MidGong } from "@/hooks/useGongTimer";
import {
  readMindfulMinutes,
  subscribeMindfulMinutes,
} from "@/lib/mindfulMinutes";
import styles from "./DurationPicker.module.css";

interface DurationPickerProps {
  midGong: MidGong;
  onMidGongChange: (value: MidGong) => void;
  onStart: (minutes: number) => void;
}

const midGongOptions = [
  { value: "none", label: "None" },
  { value: "oneThird", label: "One third" },
  { value: "half", label: "Halfway" },
  { value: "twoThirds", label: "Two thirds" },
] as const;

export default function DurationPicker({
  midGong,
  onMidGongChange,
  onStart,
}: DurationPickerProps) {
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

      <fieldset className={styles.gongChoice}>
        <legend>Mid-session gong</legend>
        <div className={styles.gongOptions}>
          {midGongOptions.map(({ value, label }) => (
            <label key={value}>
              <input
                type="radio"
                name="mid-gong"
                value={value}
                checked={value === midGong}
                onChange={() => onMidGongChange(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        className={styles.startButton}
        onClick={() => onStart(selectedMinutes)}
      >
        Start timer
      </button>

      <p className={styles.hint}>
        Every session includes a starting gong and a reminder with 10 seconds left.
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
