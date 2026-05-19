import Link from "next/link";

export default function CartCompletePage() {
  return (
    <main className="mx-auto w-full max-w-3xl bg-white px-6 py-20 text-center text-neutral-900 md:px-10 md:py-24">
      <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">ORDER</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-wide md:text-4xl">주문 완료</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-600">
        주문이 정상 접수되었습니다. 제작 진행 상황은 마이페이지 주문내역에서 확인할 수 있습니다.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
        <Link href="/user/orders" className="rounded-md bg-neutral-900 px-4 py-2 font-medium text-white transition hover:bg-neutral-800">
          주문내역 보기
        </Link>
        <Link href="/" className="rounded-md border border-neutral-300 px-4 py-2 font-medium text-neutral-800 transition hover:bg-neutral-50">
          홈으로
        </Link>
      </div>
    </main>
  );
}
