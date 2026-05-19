import Link from "next/link";

import UserAuthGate from "@/components/auth/UserAuthGate";

import MyDesignsClient from "./MyDesignsClient";

function MyDesignsPageInner() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-16 text-neutral-900 md:px-10 md:py-20">
      <header className="border-b border-neutral-200 pb-8">
        <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">
          MY DESIGNS
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-wide md:text-4xl">
          내 디자인
        </h1>
        <p className="mt-3 text-sm text-neutral-600">
          로고는 유니폼 제작용 소재이고, 유니폼 시안만 쇼핑백에 담을 수 있습니다.
          「모두 보기」로 설정하면 구경하기에 공개됩니다.
        </p>
      </header>

      <MyDesignsClient />

      <p className="mt-10 text-center text-sm">
        <Link
          href="/user/mypage"
          className="font-medium text-neutral-800 underline-offset-4 hover:underline"
        >
          ← 마이페이지
        </Link>
        {" · "}
        <Link
          href="/design"
          className="font-medium text-neutral-900 underline-offset-4 hover:underline"
        >
          디자인 스튜디오
        </Link>
      </p>
    </main>
  );
}

export default function MyDesignsPage() {
  return (
    <UserAuthGate>
      <MyDesignsPageInner />
    </UserAuthGate>
  );
}
