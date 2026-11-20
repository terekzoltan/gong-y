import test from "node:test";
import assert from "node:assert/strict";
import { getDueCues } from "../src/lib/timerCues.mjs";

for (const minutes of [1, 10, 30, 60, 90]) {
  test(`${minutes} minutes: intermediate cue at one third elapsed`, () => {
    const duration = minutes * 60;
    const remaining = (duration * 2) / 3;
    assert.deepEqual(getDueCues(duration, remaining + 1, new Set()), []);
    assert.deepEqual(
      getDueCues(duration, remaining, new Set()).map((c) => c.id),
      ["oneThird"],
    );
  });
}

for (const [midGong, remaining] of [
  ["oneThird", 80],
  ["half", 60],
  ["twoThirds", 40],
]) {
  test(`${midGong} sounds at the selected boundary and only once per session`, () => {
    const played = new Set();
    const cuesAt = (seconds) => getDueCues(120, seconds, played, midGong);

    assert.deepEqual(cuesAt(remaining + 1), []);
    assert.deepEqual(cuesAt(remaining), [{ id: midGong, remaining }]);
    assert.deepEqual(cuesAt(9).map((cue) => cue.id), [midGong, "nearEnd"]);

    played.add(midGong);
    assert.deepEqual(cuesAt(remaining + 1), []);
    assert.deepEqual(cuesAt(remaining - 1), []);
    assert.deepEqual(cuesAt(10), [{ id: "nearEnd", remaining: 10 }]);
  });
}

test("disabling the intermediate gong keeps the ten-second warning", () => {
  const played = new Set();
  assert.deepEqual(getDueCues(120, 11, played, "none"), []);
  assert.deepEqual(getDueCues(120, 10, played, "none"), [
    { id: "nearEnd", remaining: 10 },
  ]);
  played.add("nearEnd");
  assert.deepEqual(getDueCues(120, 9, played, "none"), []);
});

test("late ticks and forward seeks still emit due cues", () => {
  assert.deepEqual(
    getDueCues(1800, 1198, new Set()).map((c) => c.id),
    ["oneThird"],
  );
  assert.deepEqual(
    getDueCues(1800, 9, new Set()).map((c) => c.id),
    ["oneThird", "nearEnd"],
  );
});
test("rewind and recross never replay consumed cues", () => {
  const played = new Set(["oneThird"]);
  assert.deepEqual(getDueCues(1800, 1500, played), []);
  assert.deepEqual(getDueCues(1800, 1100, played), []);
  assert.deepEqual(
    getDueCues(1800, 10, played).map((c) => c.id),
    ["nearEnd"],
  );
  played.add("nearEnd");
  assert.deepEqual(getDueCues(1800, 8, played), []);
});
test("new sessions have their own cue history", () => {
  assert.equal(getDueCues(60, 40, new Set(["oneThird"])).length, 0);
  assert.equal(getDueCues(60, 40, new Set()).length, 1);
});
