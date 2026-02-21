import { useEffect, useRef } from "react";

export function useWakeLock(isActive: boolean) {
    const wakeLockRef = useRef<any>(null);

    useEffect(() => {
        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
                }
            } catch (err) {
                console.error(`${err} - Wake Lock request failed`);
            }
        };

        const releaseWakeLock = async () => {
            if (wakeLockRef.current) {
                try {
                    await wakeLockRef.current.release();
                    wakeLockRef.current = null;
                } catch (err) {
                    console.error(`${err} - Wake Lock release failed`);
                }
            }
        };

        if (isActive) {
            requestWakeLock();
        } else {
            releaseWakeLock();
        }

        return () => {
            releaseWakeLock();
        };
    }, [isActive]);
}
