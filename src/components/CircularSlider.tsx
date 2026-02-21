import React, { useRef, useState, useEffect } from 'react';
import styles from './CircularSlider.module.css';

interface CircularSliderProps {
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
}

export default function CircularSlider({ min, max, value, onChange }: CircularSliderProps) {
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
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const angle = calculateAngle(x, y);
        const ratio = angle / (2 * Math.PI);
        const newValue = Math.round(min + ratio * (max - min));
        onChange(Math.min(max, Math.max(min, newValue)));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleInteraction(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        handleInteraction(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchend', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, []);

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
                width={size}
                height={size}
                className={styles.svg}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
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
                    style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
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
