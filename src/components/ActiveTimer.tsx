import { useGongTimer } from "@/hooks/useGongTimer";
import { useInactivity } from "@/hooks/useInactivity";
import styles from "./ActiveTimer.module.css";

interface ActiveTimerProps {
  minutes: number;
  onCancel: () => void;
  playGong: () => void;
  audioBlocked: boolean;
}
export default function ActiveTimer({
  minutes,
  onCancel,
  playGong,
  audioBlocked,
}: ActiveTimerProps) {
  const {
    phase,
    warmUpSeconds,
    displayTime,
    pause,
    resume,
    setTimeSeconds,
    totalSeconds,
    initialDurationSeconds,
  } = useGongTimer({ initialDurationMinutes: minutes, playGong });
  const { hidden, wake } = useInactivity(phase === "running" && !audioBlocked);
  const elapsedSeconds = initialDurationSeconds - totalSeconds;
  const progress = Math.min(
    1,
    Math.max(0, elapsedSeconds / initialDurationSeconds),
  );
  return (
    <section
      className={styles.container}
      aria-label="Meditation timer"
      style={{
        background: `radial-gradient(circle at center, rgba(187, 134, 252, ${0.05 + progress * 0.15}) 0%, transparent 70%)`,
      }}
    >
      <p className={styles.eyebrow} aria-live="polite">
        {phase === "warmup"
          ? "Settle in"
          : phase === "finished"
            ? "Session complete"
            : phase === "paused"
              ? "Take your time"
              : "A little space to be"}
      </p>
      <div
        className={`${styles.timerDisplay} ${hidden ? styles.zenModeText : ""}`}
        role="timer"
        aria-label={phase === "warmup" ? "Starting in" : "Time remaining"}
      >
        {phase === "warmup" ? warmUpSeconds : displayTime}
      </div>
      {audioBlocked && (
        <div className={styles.audioNotice} role="status">
          Sound needs a tap to play.
          <button className={styles.pauseButton} onClick={playGong}>
            Enable sound
          </button>
        </div>
      )}
      <div
        className={`${styles.controlsWrapper} ${hidden ? styles.hidden : styles.visible}`}
        onFocusCapture={wake}
      >
        {phase !== "warmup" && phase !== "finished" && (
          <>
            <div className={styles.controls}>
              <input
                type="range"
                min="0"
                max={initialDurationSeconds}
                value={elapsedSeconds}
                aria-label="Session progress"
                aria-valuetext={`${displayTime} remaining`}
                className={styles.slider}
                onChange={(event) => {
                  setTimeSeconds(
                    initialDurationSeconds - Number(event.target.value),
                  );
                  wake();
                }}
              />
              <span className={styles.cueMarker} aria-hidden="true" />
            </div>
            <p className={styles.caption}>
              Gong at one third · gentle reminder with 10s left
            </p>
          </>
        )}
        {phase === "finished" && (
          <p className={styles.caption}>
            Carry this quiet into the rest of your day.
          </p>
        )}
        <div className={styles.buttonGroup}>
          {(phase === "running" || phase === "paused") && (
            <button
              className={styles.pauseButton}
              onClick={() => {
                phase === "running" ? pause() : resume();
                wake();
              }}
            >
              {phase === "running" ? "Pause" : "Resume"}
            </button>
          )}
          <button
            className={
              phase === "finished" ? styles.pauseButton : styles.cancelButton
            }
            onClick={onCancel}
          >
            {phase === "warmup"
              ? "Cancel"
              : phase === "finished"
                ? "Back to durations"
                : "Stop"}
          </button>
        </div>
      </div>
    </section>
  );
}
