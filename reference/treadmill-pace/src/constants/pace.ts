export const PACE_MIN_SECONDS = 3 * 60; // 3:00 / km
export const PACE_MAX_SECONDS = 8 * 60; // 8:00 / km

export type QuickPaceOption = Readonly<{
  label: string; // "4:15"
  seconds: number;
  digits: string; // "415"
}>;

const makeQuick = (label: string): QuickPaceOption => {
  const [mStr, sStr] = label.split(":");
  const minutes = Number(mStr);
  const seconds = Number(sStr);
  const digits = `${minutes}${sStr}`;
  return { label, seconds: minutes * 60 + seconds, digits };
};

export const QUICK_PACES: readonly QuickPaceOption[] = [
  "4:00",
  "4:15",
  "4:30",
  "4:45",
  "5:00",
  "5:15",
  "5:30",
  "5:45",
  "6:00",
  "6:30",
].map(makeQuick);

