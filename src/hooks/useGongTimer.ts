import { useTimer } from "react-timer-hook";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWakeLock } from "./useWakeLock";
import { getDueCues } from "../lib/timerCues.mjs";
import { addMindfulMinutes } from "../lib/mindfulMinutes";

type Phase = "warmup" | "running" | "paused" | "finished";
export function useGongTimer({
  initialDurationMinutes,
  playGong,
}: {
  initialDurationMinutes: number;
  playGong: () => void;
}) {
  const initialDurationSeconds = initialDurationMinutes * 60;
  const [initialExpiry] = useState(
    () => new Date(Date.now() + initialDurationSeconds * 1000),
  );
  const [phase, setPhase] = useState<Phase>("warmup");
  const [warmUpSeconds, setWarmUpSeconds] = useState(5);
  const startedRef = useRef(false);
  const finishedRef = useRef(false);
  const playedRef = useRef(new Set<string>());
  const finish = useCallback(() => {
    if (finishedRef.current || !startedRef.current) return;
    finishedRef.current = true;
    setPhase("finished");
    addMindfulMinutes(initialDurationMinutes);
  }, [initialDurationMinutes]);
  const {
    totalSeconds,
    restart,
    pause: pauseClock,
    resume: resumeClock,
  } = useTimer({
    expiryTimestamp: initialExpiry,
    autoStart: false,
    onExpire: finish,
  });
  useWakeLock(true);
  useEffect(() => {
    if (phase !== "warmup") return;
    const timeout = setTimeout(() => {
      if (warmUpSeconds > 1) {
        setWarmUpSeconds((value) => value - 1);
        return;
      }
      if (startedRef.current) return;
      startedRef.current = true;
      restart(new Date(Date.now() + initialDurationSeconds * 1000));
      setWarmUpSeconds(0);
      setPhase("running");
      playGong();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [phase, warmUpSeconds, restart, initialDurationSeconds, playGong]);
  useEffect(() => {
    if (phase !== "running" || totalSeconds <= 0) return;
    const due = getDueCues(
      initialDurationSeconds,
      totalSeconds,
      playedRef.current,
    );
    if (!due.length) return;
    due.forEach((cue) => playedRef.current.add(cue.id));
    // Coalesce cues when seeking skips both thresholds; never overlap sounds.
    playGong();
  }, [phase, totalSeconds, initialDurationSeconds, playGong]);
  const pause = () => {
    if (phase !== "running") return;
    pauseClock();
    setPhase("paused");
  };
  const resume = () => {
    if (phase !== "paused") return;
    resumeClock();
    setPhase("running");
  };
  const setTimeSeconds = (seconds: number) => {
    if (phase !== "running" && phase !== "paused") return;
    const remaining = Math.min(initialDurationSeconds, Math.max(0, seconds));
    if (remaining === 0) {
      pauseClock();
      finish();
      return;
    }
    restart(new Date(Date.now() + remaining * 1000), phase === "running");
  };
  const remaining = phase === "finished" ? 0 : totalSeconds;
  return {
    phase,
    warmUpSeconds,
    pause,
    resume,
    setTimeSeconds,
    totalSeconds: remaining,
    initialDurationSeconds,
    displayTime: `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, "0")}`,
  };
}
