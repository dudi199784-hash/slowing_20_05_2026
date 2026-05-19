import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl bg-white px-6 py-16 text-neutral-900 md:px-10 md:py-20">
      <h1 className="text-3xl font-semibold tracking-wide">개인정보처리방침</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-neutral-700">
        <p>수집 항목: 이름, 연락처, 배송지, 결제 관련 최소 정보.</p>
        <p>이용 목적: 주문 처리, 고객 지원, 서비스 품질 개선.</p>
        <p>보관 기간: 관련 법령 및 내부 정책에 따라 보관 후 파기.</p>
      </div>

      <nav className="mt-8 flex flex-wrap gap-2 text-sm" aria-label="관련 문서 링크">
        <Link href="/legal/terms" className="rounded-md border border-neutral-300 px-3 py-2 hover:bg-neutral-50">이용약관</Link>
        <Link href="/support/notice" className="rounded-md border border-neutral-300 px-3 py-2 hover:bg-neutral-50">공지사항</Link>
        <Link href="/support/faq" className="rounded-md border border-neutral-300 px-3 py-2 hover:bg-neutral-50">FAQ</Link>
        <Link href="/support/contact" className="rounded-md border border-neutral-300 px-3 py-2 hover:bg-neutral-50">고객센터</Link>
      </nav>
    </main>
  );
}
