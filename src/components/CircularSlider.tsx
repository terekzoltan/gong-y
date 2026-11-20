import type { KeyboardEvent, PointerEvent } from "react";
import styles from "./CircularSlider.module.css";

interface CircularSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

const radius = 120;
const strokeWidth = 10;
const center = radius + strokeWidth;
const size = center * 2;
const fullTurn = 2 * Math.PI;
const circumference = fullTurn * radius;

function clockwiseFraction(event: PointerEvent<SVGSVGElement>) {
  const { left, top, width, height } =
    event.currentTarget.getBoundingClientRect();
  const dx = (event.clientX - left) / width - 0.5;
  const dy = (event.clientY - top) / height - 0.5;
  // The dial starts at twelve o'clock and increases clockwise.
  const angle = Math.atan2(dy, dx) + Math.PI / 2;
  return (angle < 0 ? angle + fullTurn : angle) / fullTurn;
}

export default function CircularSlider({
  min,
  max,
  value,
  onChange,
}: CircularSliderProps) {
  const updateFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    const fraction = clockwiseFraction(event);
    onChange(Math.round(min + fraction * (max - min)));
  };

  const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const step = event.shiftKey ? 10 : 1;
    let nextValue: number;
    switch (event.key) {
      case "ArrowUp":
      case "ArrowRight":
        nextValue = Math.min(max, value + step);
        break;
      case "ArrowDown":
      case "ArrowLeft":
        nextValue = Math.max(min, value - step);
        break;
      case "Home":
        nextValue = min;
        break;
      case "End":
        nextValue = max;
        break;
      default:
        return;
    }
    event.preventDefault();
    if (nextValue !== value) onChange(nextValue);
  };

  const fraction = (value - min) / (max - min);
  const angle = fraction * fullTurn;
  const thumbX = center + radius * Math.sin(angle);
  const thumbY = center - radius * Math.cos(angle);
  const strokeDashoffset = circumference * (1 - fraction);

  return (
    <div className={styles.container}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className={styles.svg}
        role="slider"
        tabIndex={0}
        aria-label="Duration in minutes"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          if (!event.isPrimary) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (
            event.isPrimary &&
            event.currentTarget.hasPointerCapture(event.pointerId)
          ) {
            updateFromPointer(event);
          }
        }}
      >
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--glass-bg-hover)"
          strokeWidth={strokeWidth}
        />

        {/* Progress Arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
        />

        {/* Thumb */}
        <circle
          cx={thumbX}
          cy={thumbY}
          r={14}
          fill="var(--foreground)"
          filter="drop-shadow(0px 0px 4px rgba(187,134,252,0.8))"
          className={styles.thumb}
        />
      </svg>
      <div className={styles.valueDisplay}>
        <span className={styles.value}>{value}</span>
        <span className={styles.unit}>MIN</span>
      </div>
    </div>
  );
}
