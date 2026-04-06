"use client";

import { useCallback, useMemo, useState } from "react";

import { Header } from "@/components/Header";
import { HelpOrErrorMessage } from "@/components/HelpOrErrorMessage";
import { PaceInput } from "@/components/PaceInput";
import { QuickSelectButtons } from "@/components/QuickSelectButtons";
import { ResultDisplay } from "@/components/ResultDisplay";
import { SpeedAdjuster } from "@/components/SpeedAdjuster";
import {
  computeFromPaceSeconds,
  computeFromSpeed,
  digitsToPaceSeconds,
  errorMessageForPaceError,
  paceDigitsToDisplay,
  paceSecondsToDigits,
  roundTo1,
  sanitizePaceRawInput,
} from "@/utils/pace";

export default function Home() {
  const [paceRawInput, setPaceRawInput] = useState<string>("");
  const [selectedQuickPace, setSelectedQuickPace] = useState<string | null>(null);

  const parseResult = useMemo(() => digitsToPaceSeconds(paceRawInput), [paceRawInput]);

  const derived = useMemo(() => {
    if ("error" in parseResult) return null;
    return computeFromPaceSeconds(parseResult.paceSeconds);
  }, [parseResult]);

  const paceDisplay = useMemo(() => paceDigitsToDisplay(paceRawInput), [paceRawInput]);

  const errorMessage = useMemo(() => {
    if (!("error" in parseResult)) return "";
    return errorMessageForPaceError(parseResult.error);
  }, [parseResult]);

  const onChangePace = useCallback((nextRaw: string) => {
    const next = sanitizePaceRawInput(nextRaw);
    setPaceRawInput(next);
    setSelectedQuickPace(null);
  }, []);

  const onClear = useCallback(() => {
    setPaceRawInput("");
    setSelectedQuickPace(null);
  }, []);

  const onSelectQuick = useCallback((digits: string) => {
    setPaceRawInput(digits);
    setSelectedQuickPace(digits);
  }, []);

  const adjustSpeed = useCallback(
    (delta: number) => {
      if (!derived) return;
      const candidate = roundTo1(derived.speed + delta);
      const next = computeFromSpeed(candidate);
      if (!next) return;
      setPaceRawInput(paceSecondsToDigits(next.paceSeconds));
      setSelectedQuickPace(null);
    },
    [derived],
  );

  const hasValue = Boolean(derived) && !errorMessage;

  return (
    <div className="min-h-screen bg-black font-sans text-zinc-50">
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-3 px-4 py-4">
        <Header />

        <ResultDisplay
          hasValue={hasValue}
          speedDisplay={derived?.speedDisplay ?? "--.-"}
          paceDisplay={derived?.paceDisplay ?? "--:--"}
        />

        <PaceInput
          value={paceRawInput}
          displayValue={paceDisplay}
          onChange={onChangePace}
          onClear={onClear}
        />

        <QuickSelectButtons selectedDigits={selectedQuickPace} onSelect={onSelectQuick} />

        <SpeedAdjuster
          disabled={!hasValue}
          onMinus={() => adjustSpeed(-0.1)}
          onPlus={() => adjustSpeed(0.1)}
        />

        <HelpOrErrorMessage errorMessage={errorMessage} hasValue={hasValue} />
      </main>
    </div>
  );
}
