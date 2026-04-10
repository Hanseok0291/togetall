"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "홈", match: (p: string) => p === "/" },
  {
    href: "/posts",
    label: "모집",
    match: (p: string) => p.startsWith("/posts") && !p.startsWith("/posts/new"),
  },
  {
    href: "/tools/treadmill-pace",
    label: "페이스",
    match: (p: string) => p.startsWith("/tools/treadmill-pace"),
  },
  { href: "/info", label: "정보", match: (p: string) => p.startsWith("/info") },
  { href: "/races", label: "대회일정", match: (p: string) => p.startsWith("/races") },
  { href: "/posts/new", label: "글쓰기", match: (p: string) => p === "/posts/new" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95"
      aria-label="주요 메뉴"
    >
      <div className="mx-auto max-w-3xl overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max justify-around gap-0.5 px-1">
          {items.map(({ href, label, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex min-h-11 min-w-[3.25rem] shrink-0 flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 text-[11px] font-medium sm:min-w-[4rem] sm:text-xs",
                  active
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
                ].join(" ")}
              >
                <span className="max-w-[4.5rem] truncate text-center sm:max-w-none">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
