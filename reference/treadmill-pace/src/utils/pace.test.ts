import { describe, expect, it } from "vitest";

import {
  computeFromPaceSeconds,
  computeFromSpeed,
  digitsToPaceSeconds,
  formatPaceSeconds,
  paceDigitsToDisplay,
  paceSecondsToDigits,
  paceSecondsToSpeed,
  roundTo1,
  sanitizePaceRawInput,
  speedToPaceSeconds,
} from "./pace";

describe("sanitizePaceRawInput", () => {
  it("strips non-digits and caps length", () => {
    expect(sanitizePaceRawInput("4a30b")).toBe("430");
    expect(sanitizePaceRawInput("1234567")).toBe("1234");
  });
});

describe("digitsToPaceSeconds", () => {
  it("parses 3-digit (MSS) and 4-digit (MMSS)", () => {
    expect(digitsToPaceSeconds("430")).toEqual({ paceSeconds: 4 * 60 + 30 });
    expect(digitsToPaceSeconds("415")).toEqual({ paceSeconds: 4 * 60 + 15 });
    expect(digitsToPaceSeconds("800")).toEqual({ paceSeconds: 8 * 60 });
    expect(digitsToPaceSeconds("230")).toEqual({ error: "OUT_OF_RANGE" });
  });

  it("rejects invalid input", () => {
    expect(digitsToPaceSeconds("")).toEqual({ error: "EMPTY" });
    expect(digitsToPaceSeconds("42")).toEqual({ error: "TOO_SHORT" });
    expect(digitsToPaceSeconds("460")).toEqual({ error: "INVALID_SECONDS" });
  });
});

describe("paceSecondsToSpeed and roundTrip", () => {
  it("matches known pace 4:30/km → ~13.3 km/h (pace rounds when inverting speed)", () => {
    const paceSeconds = 4 * 60 + 30;
    expect(roundTo1(paceSecondsToSpeed(paceSeconds))).toBe(13.3);
    const fromSpeed = computeFromSpeed(13.3);
    expect(fromSpeed).not.toBeNull();
    expect(fromSpeed!.paceDisplay).toBe("4:31");
  });

  it("speedToPaceSeconds inverts paceSecondsToSpeed before rounding", () => {
    const s = paceSecondsToSpeed(300);
    expect(s).toBeCloseTo(12, 5);
    expect(speedToPaceSeconds(12)).toBeCloseTo(300, 5);
  });
});

describe("computeFromPaceSeconds / computeFromSpeed", () => {
  it("formats displays consistently", () => {
    const a = computeFromPaceSeconds(5 * 60);
    expect(a.paceDisplay).toBe("5:00");
    expect(a.speedDisplay).toBe("12.0");
    const b = computeFromSpeed(12.0);
    expect(b?.paceDisplay).toBe("5:00");
  });

  it("returns null when pace out of supported range after speed adjust", () => {
    expect(computeFromSpeed(25)).toBeNull();
    expect(computeFromSpeed(7.4)).toBeNull();
  });
});

describe("display helpers", () => {
  it("paceDigitsToDisplay builds mm:ss preview", () => {
    expect(paceDigitsToDisplay("430")).toBe("4:30");
    expect(paceDigitsToDisplay("53")).toBe("53");
  });

  it("paceSecondsToDigits and formatPaceSeconds", () => {
    expect(formatPaceSeconds(65)).toBe("1:05");
    expect(paceSecondsToDigits(65)).toBe("105");
  });
});
