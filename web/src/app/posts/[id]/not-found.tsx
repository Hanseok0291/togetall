import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">글을 찾을 수 없습니다</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">삭제되었거나 주소가 잘못되었을 수 있습니다.</p>
      <Link href="/posts" className="mt-6 inline-block text-sm text-zinc-900 underline dark:text-zinc-100">
        목록으로
      </Link>
    </div>
  );
}
