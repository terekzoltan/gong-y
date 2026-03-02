import { useEffect, useRef } from "react";

export function useWakeLock(isActive: boolean) {
    const wakeLockRef = useRef<any>(null);

    useEffect(() => {
        let isMounted = true;

        const requestWakeLock = async () => {
            try {
                if (
                    isActive &&
                    document.visibilityState === "visible" &&
                    !wakeLockRef.current &&
                    "wakeLock" in navigator
                ) {
                    wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
                    wakeLockRef.current.addEventListener("release", () => {
                        wakeLockRef.current = null;
                        if (isMounted && isActive && document.visibilityState === "visible") {
                            requestWakeLock();
                        }
                    });
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

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                requestWakeLock();
            } else {
                releaseWakeLock();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        if (isActive) {
            requestWakeLock();
        } else {
            releaseWakeLock();
        }

        return () => {
            isMounted = false;
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            releaseWakeLock();
        };
    }, [isActive]);
}
