import { PACE_MAX_SECONDS, PACE_MIN_SECONDS } from "@/constants/pace";

export type PaceParseError =
  | "EMPTY"
  | "TOO_SHORT"
  | "INVALID_SECONDS"
  | "OUT_OF_RANGE";

export function sanitizePaceRawInput(next: string): string {
  const digitsOnly = next.replace(/\D/g, "");
  return digitsOnly.slice(0, 4);
}

export function digitsToPaceSeconds(
  digits: string,
): { paceSeconds: number } | { error: PaceParseError } {
  if (!digits) return { error: "EMPTY" };
  if (digits.length < 3) return { error: "TOO_SHORT" };

  const minutes =
    digits.length === 3 ? Number(digits.slice(0, 1)) : Number(digits.slice(0, 2));
  const seconds = Number(digits.slice(-2));

  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return { error: "TOO_SHORT" };
  }

  if (seconds >= 60) return { error: "INVALID_SECONDS" };

  const paceSeconds = minutes * 60 + seconds;
  if (paceSeconds < PACE_MIN_SECONDS || paceSeconds > PACE_MAX_SECONDS) {
    return { error: "OUT_OF_RANGE" };
  }
  return { paceSeconds };
}

export function formatPaceSeconds(paceSeconds: number): string {
  const m = Math.floor(paceSeconds / 60);
  const s = paceSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function paceSecondsToDigits(paceSeconds: number): string {
  const m = Math.floor(paceSeconds / 60);
  const s = paceSeconds % 60;
  return `${m}${String(s).padStart(2, "0")}`;
}

export function paceDigitsToDisplay(digits: string): string {
  if (!digits) return "";
  if (digits.length <= 2) return digits;
  const minutes = digits.length === 3 ? digits.slice(0, 1) : digits.slice(0, 2);
  const seconds = digits.slice(-2);
  return `${Number(minutes)}:${seconds}`;
}

export function paceSecondsToSpeed(paceSeconds: number): number {
  const minutes = paceSeconds / 60;
  return 60 / minutes;
}

export function speedToPaceSeconds(speed: number): number {
  return 3600 / speed; // seconds per km
}

export function roundTo1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function computeFromPaceSeconds(paceSeconds: number) {
  const speed = roundTo1(paceSecondsToSpeed(paceSeconds));
  const speedDisplay = speed.toFixed(1);
  const paceDisplay = formatPaceSeconds(paceSeconds);
  return { paceSeconds, paceDisplay, speed, speedDisplay } as const;
}

export function computeFromSpeed(speed: number) {
  const paceSecondsRaw = speedToPaceSeconds(speed);
  const paceSeconds = Math.round(paceSecondsRaw); // round seconds as requested
  if (paceSeconds < PACE_MIN_SECONDS || paceSeconds > PACE_MAX_SECONDS) return null;
  const normalizedSpeed = roundTo1(speed);
  return {
    paceSeconds,
    paceDisplay: formatPaceSeconds(paceSeconds),
    speed: normalizedSpeed,
    speedDisplay: normalizedSpeed.toFixed(1),
  } as const;
}

export function errorMessageForPaceError(err: PaceParseError): string {
  switch (err) {
    case "EMPTY":
      return "";
    case "TOO_SHORT":
      return "페이스를 3~4자리 숫자로 입력해 주세요. 예) 430 → 4:30";
    case "INVALID_SECONDS":
      return "초는 00~59 범위만 입력할 수 있어요. 예) 460은 4:60이어서 불가";
    case "OUT_OF_RANGE":
      return "허용 범위는 3:00/km ~ 8:00/km 입니다.";
  }
}

