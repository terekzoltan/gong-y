import { useCallback, useEffect, useRef, useState } from "react";
const SOUNDS = [
  "/sounds/bong-105459.mp3",
  "/sounds/gong-79191.mp3",
  "/sounds/instrument_gong_soft-107870.mp3",
];
export function useGongAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const prepareAudio = useCallback(() => {
    audioRef.current?.pause();
    const audio = new Audio(SOUNDS[Math.floor(Math.random() * SOUNDS.length)]);
    audioRef.current = audio;
    audio.muted = true;
    setAudioBlocked(false);
    // Unlock this same element within the Start button's user gesture.
    void audio
      .play()
      .then(() => {
        if (audioRef.current !== audio || !audio.muted) return;
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      })
      .catch(() => {
        if (audioRef.current === audio) setAudioBlocked(true);
      });
  }, []);
  const playGong = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    audio.currentTime = 0;
    void audio
      .play()
      .then(() => {
        if (audioRef.current === audio) setAudioBlocked(false);
      })
      .catch(() => {
        if (audioRef.current === audio) setAudioBlocked(true);
      });
  }, []);
  const stopAudio = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);
  useEffect(() => stopAudio, [stopAudio]);
  return { prepareAudio, playGong, stopAudio, audioBlocked };
}
