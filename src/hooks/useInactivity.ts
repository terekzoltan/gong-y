import { useCallback, useEffect, useRef, useState } from "react";
export function useInactivity(enabled: boolean) {
  const [hidden, setHidden] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wake = useCallback(() => {
    setHidden(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (enabled) timeoutRef.current = setTimeout(() => setHidden(true), 3000);
  }, [enabled]);
  useEffect(() => {
    const events = ["pointermove", "pointerdown", "keydown", "focusin"];
    events.forEach((event) => window.addEventListener(event, wake));
    if (enabled) timeoutRef.current = setTimeout(() => setHidden(true), 3000);
    return () => {
      events.forEach((event) => window.removeEventListener(event, wake));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [wake, enabled]);
  return { hidden: enabled && hidden, wake };
}
