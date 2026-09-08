export function getDueCues(durationSeconds, remainingSeconds, played) {
  const cues = [
    { id: "oneThird", remaining: (durationSeconds * 2) / 3 },
    { id: "nearEnd", remaining: 10 },
  ];
  return cues.filter(
    (cue) => remainingSeconds <= cue.remaining && !played.has(cue.id),
  );
}
