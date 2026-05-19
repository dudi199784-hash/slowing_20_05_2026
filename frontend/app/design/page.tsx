import { Suspense } from "react";

import DesignStudioClient from "./DesignStudioClient";

export default function DesignPage() {
  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden bg-white pt-24 text-neutral-900 md:pt-28">
      <header className="mx-auto max-w-7xl px-6 md:px-10">
        <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">DESIGN</p>
        <h1 className="mt-2 font-[family-name:var(--font-brand-serif)] text-2xl font-medium tracking-wide md:text-3xl">
          디자인 스튜디오
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">
          상품(축구화·유니폼·키퍼 장갑·스포츠 용품) 시안을 만들거나, 팀 로고를
          생성할 수 있습니다. 로그인 후 이용하세요.
        </p>
      </header>
      <div className="mt-10">
        <Suspense
          fallback={
            <p className="px-6 text-sm text-neutral-500 md:px-10">
              스튜디오 불러오는 중…
            </p>
          }
        >
          <DesignStudioClient />
        </Suspense>
      </div>
    </div>
  );
}
