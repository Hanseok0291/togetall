import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "정보 · 러닝·운동 팁",
};

export default function InfoPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">정보</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        러닝·운동 팁과 기초 지식을 모아 두는 공간입니다. 모집 게시판과는 별도로, 읽기 위주의 글을 올릴 예정이에요.
      </p>
      <div className="mt-10 rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        앞으로 글이 여기에 표시됩니다.
      </div>
    </div>
  );
}
