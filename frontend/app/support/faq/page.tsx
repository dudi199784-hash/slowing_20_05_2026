const FAQ = [
  { q: "상품은 새로 제작되나요?", a: "기본 베이스 상품은 고정이며, AI 디자인만 입혀 제작됩니다." },
  { q: "수량별 이니셜 입력이 가능한가요?", a: "가능합니다. 구매 옵션에서 수량만큼 이름/이니셜을 입력할 수 있습니다." },
  { q: "주문 후 수정 가능한가요?", a: "제작 시작 전 단계에서는 고객센터 문의를 통해 수정 가능합니다." },
] as const;

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-4xl bg-white px-6 py-16 text-neutral-900 md:px-10 md:py-20">
      <h1 className="text-3xl font-semibold tracking-wide">FAQ</h1>
      <div className="mt-8 space-y-4">
        {FAQ.map((item, i) => (
          <article key={i} className="rounded-lg border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold">Q. {item.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">A. {item.a}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
