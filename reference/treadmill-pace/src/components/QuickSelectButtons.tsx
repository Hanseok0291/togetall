import { QUICK_PACES } from "@/constants/pace";

type Props = Readonly<{
  selectedDigits: string | null;
  onSelect: (digits: string) => void;
}>;

export function QuickSelectButtons({ selectedDigits, onSelect }: Props) {
  const shouldPulse = selectedDigits === null;

  return (
    <section
      className="group rounded-2xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 px-4 py-4 shadow-sm shadow-black/30 transition-colors hover:border-white/20"
      aria-label="자주 쓰는 페이스 빠른 선택"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-xs font-semibold tracking-wide text-zinc-200">QUICK SELECT</div>
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[11px] font-semibold text-zinc-200 transition-colors group-hover:border-white/20 group-hover:bg-black/25">
          <span aria-hidden="true">👇</span>
          <span>눌러서 바로 선택</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {QUICK_PACES.map((p) => {
          const selected = selectedDigits === p.digits;
          return (
            <button
              key={p.digits}
              type="button"
              onClick={() => onSelect(p.digits)}
              aria-pressed={selected}
              aria-label={`${p.label} per km 페이스 선택`}
              className={[
                "min-h-11 cursor-pointer rounded-xl border px-0 py-2 text-xs font-semibold tabular-nums shadow-sm transition-[transform,colors,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 active:translate-y-px hover:-translate-y-px hover:shadow-md hover:shadow-black/40",
                selected
                  ? "border-emerald-300/60 bg-emerald-300/25 text-emerald-50 shadow-emerald-500/15"
                  : [
                      shouldPulse ? "quick-select-attn" : "",
                      "border-white/20 bg-black/30 text-zinc-50 hover:border-white/35 hover:bg-white/12",
                    ].join(" "),
              ].join(" ")}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

