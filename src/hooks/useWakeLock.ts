import { useEffect, useRef } from "react";

export function useWakeLock(isActive: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const requestInFlightRef = useRef<Promise<WakeLockSentinel> | null>(null);
  const requestWakeLockRef = useRef<() => void>(() => {});

  useEffect(() => {
    let isCurrent = true;

    const requestWakeLock = async () => {
      if (
        !isCurrent ||
        !isActive ||
        document.visibilityState !== "visible" ||
        !("wakeLock" in navigator) ||
        wakeLockRef.current ||
        requestInFlightRef.current
      ) {
        return;
      }

      let request: Promise<WakeLockSentinel> | null = null;

      try {
        request = navigator.wakeLock.request("screen");
        requestInFlightRef.current = request;
        const sentinel = await request;

        if (!isCurrent || !isActive || document.visibilityState !== "visible") {
          await sentinel.release();
          return;
        }

        wakeLockRef.current = sentinel;
        sentinel.addEventListener("release", () => {
          if (wakeLockRef.current === sentinel) {
            wakeLockRef.current = null;
          }
        });
      } catch (err) {
        console.warn(`${err} - Wake Lock request failed`);
      } finally {
        if (request && requestInFlightRef.current === request) {
          requestInFlightRef.current = null;
        }

        // React Strict Mode can dispose an effect while its request is pending.
        // Hand the next active effect a chance to acquire the lock once it settles.
        if (!isCurrent) {
          requestWakeLockRef.current();
        }
      }
    };

    const releaseWakeLock = async () => {
      const sentinel = wakeLockRef.current;
      if (!sentinel) return;

      wakeLockRef.current = null;
      try {
        if (!sentinel.released) {
          await sentinel.release();
        }
      } catch (err) {
        console.warn(`${err} - Wake Lock release failed`);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void requestWakeLock();
      } else {
        void releaseWakeLock();
      }
    };

    const scheduleWakeLock = () => {
      void requestWakeLock();
    };
    requestWakeLockRef.current = scheduleWakeLock;

    if (isActive) {
      void requestWakeLock();
      document.addEventListener("visibilitychange", handleVisibilityChange);
    } else {
      void releaseWakeLock();
    }

    return () => {
      isCurrent = false;
      if (isActive) {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      }
      if (requestWakeLockRef.current === scheduleWakeLock) {
        requestWakeLockRef.current = () => {};
      }
      void releaseWakeLock();
    };
  }, [isActive]);
}
