import styles from "./TimerCard.module.css";

interface TimerCardProps {
    minutes: number;
    onClick: (minutes: number) => void;
}

export default function TimerCard({ minutes, onClick }: TimerCardProps) {
    return (
        <button className={styles.card} onClick={() => onClick(minutes)}>
            <span className={styles.duration}>{minutes}</span>
            <span className={styles.label}>MIN</span>
        </button>
    );
}
