type Props = Readonly<{
  disabled: boolean;
  onMinus: () => void;
  onPlus: () => void;
}>;

export function SpeedAdjuster({ disabled, onMinus, onPlus }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-zinc-300">FINE ADJUST</div>
          <div className="text-[11px] text-zinc-400">0.1 km/h 단위</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMinus}
            disabled={disabled}
            className="h-11 w-14 rounded-xl border border-white/10 bg-black/25 text-xl font-semibold text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 disabled:opacity-40"
            aria-label="트레드밀 속도 0.1 km/h 낮추기"
          >
            −
          </button>
          <button
            type="button"
            onClick={onPlus}
            disabled={disabled}
            className="h-11 w-14 rounded-xl border border-white/10 bg-black/25 text-xl font-semibold text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 disabled:opacity-40"
            aria-label="트레드밀 속도 0.1 km/h 올리기"
          >
            +
          </button>
        </div>
      </div>
    </section>
  );
}

