import Link from "next/link";

import BrowseClient from "./BrowseClient";

export default function BrowsePage() {
  return (
    <main className="mx-auto w-full max-w-7xl bg-white px-6 py-16 text-neutral-900 md:px-10 md:py-20">
      <header className="border-b border-neutral-200 pb-8">
        <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">
          BROWSE
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-wide md:text-4xl">
          구경하기
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">
          회원이 「모두 보기」로 공유한 로고·유니폼 시안입니다. 카드를 눌러 크게
          보고, 좋아요를 남길 수 있습니다.
        </p>
      </header>

      <BrowseClient />

      <p className="mt-12 text-center text-sm text-neutral-500">
        <Link href="/" className="underline-offset-4 hover:underline">
          홈으로
        </Link>
        {" · "}
        <Link href="/design" className="underline-offset-4 hover:underline">
          디자인 스튜디오
        </Link>
      </p>
    </main>
  );
}
