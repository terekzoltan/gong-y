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
