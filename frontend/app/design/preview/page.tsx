import { Suspense } from "react";

import DesignPreviewClient from "./DesignPreviewClient";

export default function DesignPreviewPage() {
  return (
    <main className="mx-auto w-full max-w-7xl bg-white px-6 py-12 text-neutral-900 md:px-10 md:py-16">
      <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">
        DESIGN PREVIEW
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-brand-serif)] text-2xl font-medium tracking-wide md:text-3xl">
        생성 결과 상세
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">
        생성된 디자인을 크게 확인하고, 저장하거나 주문 단계로 이동할 수 있습니다.
      </p>
      <Suspense
        fallback={
          <p className="mt-12 text-sm text-neutral-500">불러오는 중…</p>
        }
      >
        <DesignPreviewClient />
      </Suspense>
    </main>
  );
}
