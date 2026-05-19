import Link from "next/link";

const NOTICES = [
  { id: 1, title: "2026-04 배송 일정 안내", date: "2026-04-26" },
  { id: 2, title: "AI 디자인 생성 정책 업데이트", date: "2026-04-18" },
  { id: 3, title: "결제 시스템 점검 공지", date: "2026-04-09" },
] as const;

export default function NoticePage() {
  return (
    <main className="mx-auto w-full max-w-4xl bg-white px-6 py-16 text-neutral-900 md:px-10 md:py-20">
      <h1 className="text-3xl font-semibold tracking-wide">공지사항</h1>
      <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
        {NOTICES.map((n) => (
          <li key={n.id} className="flex items-center justify-between gap-3 py-4 text-sm">
            <span>{n.title}</span>
            <span className="text-neutral-500">{n.date}</span>
          </li>
        ))}
      </ul>

      <nav className="mt-8 flex flex-wrap gap-2 text-sm" aria-label="운영 페이지 링크">
        <Link href="/support/faq" className="rounded-md border border-neutral-300 px-3 py-2 hover:bg-neutral-50">FAQ</Link>
        <Link href="/support/contact" className="rounded-md border border-neutral-300 px-3 py-2 hover:bg-neutral-50">고객센터</Link>
        <Link href="/legal/terms" className="rounded-md border border-neutral-300 px-3 py-2 hover:bg-neutral-50">이용약관</Link>
        <Link href="/legal/privacy" className="rounded-md border border-neutral-300 px-3 py-2 hover:bg-neutral-50">개인정보처리방침</Link>
      </nav>
    </main>
  );
}
