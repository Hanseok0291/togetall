export function Header() {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-50">
          Treadmill Pace
        </h1>
        <p className="text-xs text-zinc-300 break-keep">
          목표 페이스(km)를 표준 km/h로 환산합니다. 기기마다 표시가 조금 다를 수 있어요.
        </p>
      </div>
      <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-zinc-200">
        km/h
      </div>
    </header>
  );
}

