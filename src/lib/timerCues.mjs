export const midGongFractions = {
  none: null,
  oneThird: 1 / 3,
  half: 1 / 2,
  twoThirds: 2 / 3,
};

export function getDueCues(
  durationSeconds,
  remainingSeconds,
  played,
  midGong = "oneThird",
) {
  const fraction = midGongFractions[midGong];
  const cues = [];
  if (fraction != null) {
    const elapsed = durationSeconds * fraction;
    cues.push({ id: midGong, remaining: durationSeconds - elapsed });
  }
  cues.push({ id: "nearEnd", remaining: 10 });
  return cues.filter(
    (cue) => remainingSeconds <= cue.remaining && !played.has(cue.id),
  );
}
