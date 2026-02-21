"use client";

import { useState } from "react";
import DurationPicker from "@/components/DurationPicker";
import ActiveTimer from "@/components/ActiveTimer";
import styles from "./page.module.css";

export default function Home() {
    const [activeMinutes, setActiveMinutes] = useState<number | null>(null);

    const handleStart = (minutes: number) => {
        setActiveMinutes(minutes);
    };

    const handleCancel = () => {
        setActiveMinutes(null);
    };

    return (
        <main className={styles.main}>
            {activeMinutes ? (
                <ActiveTimer minutes={activeMinutes} onCancel={handleCancel} />
            ) : (
                <DurationPicker onStart={handleStart} />
            )}
        </main>
    );
}
