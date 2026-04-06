import Link from "next/link";

export function HeaderFallback() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Togetall
        </Link>
        <div
          className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-800"
          aria-hidden
        />
      </div>
    </header>
  );
}
