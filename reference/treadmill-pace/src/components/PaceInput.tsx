type Props = Readonly<{
  value: string;
  displayValue: string;
  placeholder?: string;
  onChange: (nextRaw: string) => void;
  onClear: () => void;
}>;

export function PaceInput({
  value,
  displayValue,
  placeholder = "예: 430",
  onChange,
  onClear,
}: Props) {
  const inputId = "pace-digits-input";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4" aria-labelledby="pace-section-label">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div id="pace-section-label" className="text-xs font-medium text-zinc-300">
            TARGET PACE
          </div>
          <div className="mt-1 flex items-baseline gap-2" aria-live="polite" aria-atomic="true">
            <div className="tabular-nums text-3xl font-semibold text-zinc-50">
              {displayValue || "--"}
            </div>
            <div className="text-sm text-zinc-400">/km</div>
          </div>
        </div>
        <button
          type="button"
          className="min-h-11 shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 disabled:opacity-40"
          onClick={onClear}
          disabled={!value}
          aria-label="입력한 페이스 지우기"
        >
          삭제
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <label htmlFor={inputId} className="sr-only">
          페이스 숫자 입력 (분과 초, 최대 4자리)
        </label>
        <input
          id={inputId}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-base text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
        />
        <p className="text-xs text-zinc-400 sm:w-1/2 sm:text-right">숫자만 · 최대 4자리</p>
      </div>
    </section>
  );
}

