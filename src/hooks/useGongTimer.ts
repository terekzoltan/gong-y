import { useTimer } from "react-timer-hook";
import { useEffect, useRef, useState } from "react";
import { useWakeLock } from "./useWakeLock";

interface UseGongTimerProps {
    initialDurationMinutes: number;
    onFinish?: () => void;
}

const GONG_SOUNDS = [
    "/sounds/bong-105459.mp3",
    "/sounds/gong-79191.mp3",
    "/sounds/instrument_gong_soft-107870.mp3",
];

export function useGongTimer({ initialDurationMinutes, onFinish }: UseGongTimerProps) {
    const [gongPlayed10s, setGongPlayed10s] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Random sound selection - happens once per timer instance
    const [selectedSound] = useState(() => {
        const randomIndex = Math.floor(Math.random() * GONG_SOUNDS.length);
        return GONG_SOUNDS[randomIndex];
    });

    const getExpiryTimestamp = (minutes: number) => {
        const time = new Date();
        time.setSeconds(time.getSeconds() + minutes * 60);
        return time;
    };

    const getExpiryTimestampFromSeconds = (seconds: number) => {
        const time = new Date();
        time.setSeconds(time.getSeconds() + seconds);
        return time;
    };

    // Track last play time to prevent double-plays in React Strict Mode or rapid updates
    const lastPlayTimeRef = useRef<number>(0);

    const playGong = () => {
        const now = Date.now();
        // Prevent playing if played less than 1000ms ago
        if (now - lastPlayTimeRef.current < 1000) return;

        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            lastPlayTimeRef.current = now;
        }
    };

    const {
        totalSeconds,
        seconds,
        minutes,
        hours,
        isRunning,
        start,
        pause,
        resume,
        restart,
    } = useTimer({
        expiryTimestamp: getExpiryTimestamp(initialDurationMinutes),
        onExpire: () => {
            // Save mindful minutes tracking to localStorage
            const stored = localStorage.getItem("gongy_total_minutes");
            const currentTotal = stored ? parseInt(stored, 10) : 0;
            localStorage.setItem("gongy_total_minutes", (currentTotal + initialDurationMinutes).toString());

            if (onFinish) onFinish();
        },
        autoStart: false,
    });

    // Init audio with selected random sound
    useEffect(() => {
        audioRef.current = new Audio(selectedSound);
    }, [selectedSound]);

    // Wake Lock API
    useWakeLock(isRunning);

    // Monitor for 10s remaining
    useEffect(() => {
        if (isRunning && totalSeconds === 10 && !gongPlayed10s) {
            playGong();
            setGongPlayed10s(true);
        }
    }, [totalSeconds, isRunning, gongPlayed10s]);

    const startTimer = () => {
        const time = getExpiryTimestamp(initialDurationMinutes);
        restart(time);
        playGong();
        setGongPlayed10s(false);
    };

    // Set time in SECONDS for video-scrubber style slider
    const setTimeSeconds = (newSeconds: number) => {
        const time = getExpiryTimestampFromSeconds(newSeconds);
        restart(time, isRunning); // Keep running state
    };

    const stopTimer = () => {
        pause();
    };

    return {
        totalSeconds,
        displayTime: `${minutes}:${seconds.toString().padStart(2, "0")}`,
        isRunning,
        startTimer,
        stopTimer,
        pause,
        resume,
        setTimeSeconds,
        initialDurationSeconds: initialDurationMinutes * 60,
    };
}
