type Props = Readonly<{
  speedDisplay: string;
  paceDisplay: string;
  hasValue: boolean;
}>;

export function ResultDisplay({ speedDisplay, paceDisplay, hasValue }: Props) {
  return (
    <section
      className="rounded-2xl border border-white/10 bg-linear-to-b from-zinc-900 to-black px-4 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
      aria-labelledby="result-heading"
    >
      <h2 id="result-heading" className="sr-only">
        변환 결과
      </h2>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs font-medium text-zinc-300">TREADMILL SPEED</div>
          <div
            className="mt-1 flex items-baseline gap-2"
            aria-live={hasValue ? "polite" : "off"}
            aria-atomic="true"
          >
            <div className="tabular-nums text-5xl font-semibold tracking-tight text-emerald-300">
              {hasValue ? speedDisplay : "--.-"}
            </div>
            <div className="text-sm text-zinc-400">km/h</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium text-zinc-300">PACE</div>
          <div className="mt-1 tabular-nums text-2xl font-semibold text-zinc-50">
            {hasValue ? paceDisplay : "--:--"}
          </div>
          <div className="text-xs text-zinc-400">/km</div>
        </div>
      </div>
    </section>
  );
}

