export function SupabaseSetupMessage() {
  return (
    <div className="mx-auto max-w-full w-full px-4 py-8">
      <p className="text-zinc-800 dark:text-zinc-200">
        Supabase가 아직 연결되지 않았습니다. <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm dark:bg-zinc-800">web</code> 폴더에{" "}
        <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm dark:bg-zinc-800">.env.local</code>을 만들고{" "}
        <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm dark:bg-zinc-800">.env.example</code>의 값을 채운 뒤 개발 서버를 다시
        시작하세요.
      </p>
    </div>
  );
}
