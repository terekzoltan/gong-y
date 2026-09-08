import React, { useRef, useState } from "react";
import styles from "./CircularSlider.module.css";

interface CircularSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export default function CircularSlider({
  min,
  max,
  value,
  onChange,
}: CircularSliderProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const radius = 120;
  const strokeWidth = 10;
  const center = { x: radius + strokeWidth, y: radius + strokeWidth };
  const size = (radius + strokeWidth) * 2;

  const calculateAngle = (x: number, y: number): number => {
    const dx = x - center.x;
    const dy = y - center.y;
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) {
      angle += 2 * Math.PI;
    }
    return angle;
  };

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) * size) / rect.width;
    const y = ((clientY - rect.top) * size) / rect.height;

    const angle = calculateAngle(x, y);
    const ratio = angle / (2 * Math.PI);
    const newValue = Math.round(min + ratio * (max - min));
    onChange(Math.min(max, Math.max(min, newValue)));
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    handleInteraction(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    handleInteraction(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    const step = e.shiftKey ? 10 : 1;
    let nextValue = value;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") nextValue = value + step;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown")
      nextValue = value - step;
    if (e.key === "Home") nextValue = min;
    if (e.key === "End") nextValue = max;
    if (nextValue !== value) {
      e.preventDefault();
      onChange(Math.min(max, Math.max(min, nextValue)));
    }
  };

  const ratio = (value - min) / (max - min);
  const angle = ratio * 2 * Math.PI;
  const thumbX = center.x + radius * Math.sin(angle);
  const thumbY = center.y - radius * Math.cos(angle);

  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ratio * circumference;

  return (
    <div className={styles.container}>
      <svg
        ref={svgRef}
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Background Track */}
        <circle
          cx={center.x}
          cy={center.y}
          r={radius}
          fill="none"
          stroke="var(--glass-bg-hover)"
          strokeWidth={strokeWidth}
        />

        {/* Progress Arc */}
        <circle
          cx={center.x}
          cy={center.y}
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
