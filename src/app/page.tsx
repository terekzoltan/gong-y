"use client";

import { useState } from "react";
import DurationPicker from "@/components/DurationPicker";
import ActiveTimer from "@/components/ActiveTimer";
import styles from "./page.module.css";
import { useGongAudio } from "@/hooks/useGongAudio";
import type { MidGong } from "@/hooks/useGongTimer";

export default function Home() {
  const [activeMinutes, setActiveMinutes] = useState<number | null>(null);
  const [midGong, setMidGong] = useState<MidGong>("oneThird");
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
          midGong={midGong}
          onCancel={handleCancel}
          playGong={playGong}
          audioBlocked={audioBlocked}
        />
      ) : (
        <DurationPicker
          midGong={midGong}
          onMidGongChange={setMidGong}
          onStart={handleStart}
        />
      )}
    </main>
  );
}
