"use client";

import { useState } from "react";
import DurationPicker from "@/components/DurationPicker";
import ActiveTimer from "@/components/ActiveTimer";
import styles from "./page.module.css";
import { useGongAudio } from "@/hooks/useGongAudio";

export default function Home() {
  const [activeMinutes, setActiveMinutes] = useState<number | null>(null);
  const { prepareAudio, playGong, stopAudio, audioBlocked } = useGongAudio();

  const handleStart = (minutes: number) => {
    prepareAudio();
    setActiveMinutes(minutes);
  };

  const handleCancel = () => {
    stopAudio();
    setActiveMinutes(null);
  };

  return (
    <main className={styles.main}>
      {activeMinutes ? (
        <ActiveTimer
          minutes={activeMinutes}
          onCancel={handleCancel}
          playGong={playGong}
          audioBlocked={audioBlocked}
        />
      ) : (
        <DurationPicker onStart={handleStart} />
      )}
    </main>
  );
}
