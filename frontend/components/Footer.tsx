import Link from "next/link";

const TRUST_LINKS = [
  { label: "공지사항", href: "/support/notice" },
  { label: "FAQ", href: "/support/faq" },
  { label: "고객센터", href: "/support/contact" },
  { label: "이용약관", href: "/legal/terms" },
  { label: "개인정보처리방침", href: "/legal/privacy" },
] as const;

const SOCIAL_LINKS = [
  { label: "인스타", href: "" },
  { label: "유튜브", href: "" },
  { label: "틱톡", href: "" },
] as const;

export default function Footer() {
  return (
    <footer
      id="site-footer"
      className="w-full bg-black px-6 py-14 text-white md:px-10"
      aria-label="푸터"
    >
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-white/90">
          SLOWIND
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <section aria-label="운영 신뢰 링크">
            <h2 className="text-sm font-semibold text-white">운영/신뢰</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {TRUST_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="소셜 링크">
            <h2 className="text-sm font-semibold text-white">SNS</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="transition hover:text-white hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="mt-10 border-t border-white/15 pt-5 text-xs text-white/60">
          © 2026 SLOWIND. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
