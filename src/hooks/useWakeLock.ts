import { useEffect, useRef } from "react";

export function useWakeLock(isActive: boolean) {
    const wakeLockRef = useRef<any>(null);
    const isRequestingRef = useRef(false);
    const isActiveRef = useRef(isActive);

    useEffect(() => {
        isActiveRef.current = isActive;
    }, [isActive]);

    useEffect(() => {
        let isMounted = true;

        const requestWakeLock = async () => {
            try {
                if (
                    isActiveRef.current &&
                    document.visibilityState === "visible" &&
                    !wakeLockRef.current &&
                    !isRequestingRef.current &&
                    "wakeLock" in navigator
                ) {
                    isRequestingRef.current = true;
                    wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
                    wakeLockRef.current.onrelease = () => {
                        wakeLockRef.current = null;
                        if (isMounted && isActiveRef.current && document.visibilityState === "visible") {
                            requestWakeLock();
                        }
                    };
                }
            } catch (err) {
                console.error(`${err} - Wake Lock request failed`);
            } finally {
                isRequestingRef.current = false;
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
