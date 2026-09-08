const STORAGE_KEY = "gongy_total_minutes";
export function readMindfulMinutes(): number {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}
export function addMindfulMinutes(minutes: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(readMindfulMinutes() + minutes));
  } catch {
    /* Storage failure must not prevent session completion. */
  }
}

export function subscribeMindfulMinutes(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}
