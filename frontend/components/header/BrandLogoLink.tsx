"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

type BrandLogoLinkProps = {
  className?: string;
  children: ReactNode;
};

/**
 * 홈(`/`)에서 다시 눌러도 Next.js Link는 같은 경로라 네비게이션을 생략함.
 * 이미 메인일 때는 스크롤 초기화 + 서버 컴포넌트 재검증으로 "홈으로 돌아온" 느낌을 줌.
 */
export default function BrandLogoLink({ className, children }: BrandLogoLinkProps) {
  const pathname = usePathname();
  const router = useRouter();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.refresh();
  }

  return (
    <Link href="/" className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
