import Link from "next/link";

import Nav from "./Nav";

type MainNavBarProps = {
  isHome: boolean;
  isScrolled: boolean;
};

const logoSerif =
  "font-[family-name:var(--font-brand-serif)] min-w-0 truncate transition-[color,font-size,font-weight] duration-500";

/**
 * lg 이상: 좌·우 동일 flex 영역 + 로고는 헤더 정중앙(absolute).
 * lg 미만: 로고 좌 · 메뉴 우.
 */
export default function MainNavBar({ isHome, isScrolled }: MainNavBarProps) {
  const isTransparentHero = isHome && !isScrolled;

  return (
    <div
      className={`border-b px-4 transition-colors duration-500 md:px-8 ${
        isHome
          ? isScrolled
            ? "border-neutral-200 bg-white/95 text-neutral-900 backdrop-blur-sm"
            : "border-transparent bg-transparent text-neutral-900"
          : "border-neutral-200 bg-white/95 text-neutral-900 backdrop-blur-sm"
      }`}
    >
      <div className="relative mx-auto flex w-full max-w-[1900px] items-center justify-between gap-3 py-3 md:gap-4 lg:py-3">
        <div className="hidden min-w-[9rem] flex-1 items-center lg:flex">
          <Link
            href="/support/contact"
            className={`shrink-0 whitespace-nowrap text-xs font-medium tracking-wide underline-offset-4 transition-colors duration-500 hover:underline sm:text-sm ${
              isTransparentHero
                ? "text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
                : "text-neutral-900"
            }`}
          >
            + 고객센터
          </Link>
        </div>

        <Link
          href="/"
          className={`${logoSerif} z-10 shrink-0 text-base font-medium tracking-[0.18em] sm:text-lg sm:tracking-[0.24em] md:text-xl md:tracking-[0.28em] lg:absolute lg:left-1/2 lg:-translate-x-1/2 ${
            isTransparentHero
              ? "text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
              : "text-neutral-900"
          }`}
        >
          SLOWIND
        </Link>

        <div className="flex flex-1 justify-end lg:min-w-[9rem]">
          <Nav variant={isTransparentHero ? "overlay" : "default"} />
        </div>
      </div>
    </div>
  );
}
