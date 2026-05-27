#!/usr/bin/env node
import assert from "node:assert/strict";

function minutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function duration(start, end) {
  const s = minutes(start);
  let e = minutes(end);
  if (e <= s) e += 24 * 60;
  return e - s;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  const aS = minutes(aStart);
  const aE = aS + duration(aStart, aEnd);
  const bS = minutes(bStart);
  const bE = bS + duration(bStart, bEnd);
  return aS < bE && aE > bS;
}

function restHours(previousEndIso, nextStartIso) {
  return (new Date(nextStartIso).getTime() - new Date(previousEndIso).getTime()) / 3600000;
}

assert.equal(duration("17:00", "23:30"), 390);
assert.equal(duration("20:00", "02:00"), 360);
assert.equal(overlaps("17:00", "21:00", "20:00", "23:00"), true);
assert.equal(overlaps("17:00", "21:00", "21:00", "23:00"), false);
assert.equal(restHours("2026-05-12T23:00", "2026-05-13T09:00"), 10);
assert.equal(restHours("2026-05-12T23:00", "2026-05-13T08:30") < 10, true);

console.log("scheduler-rules.test.mjs: ok");
