"use client";

import { usePathname } from "next/navigation";

import AdvertisingBar from "@/components/header/AdvertisingBar";
import MainNavBar from "@/components/header/MainNavBar";
import { HEADER_NOTICE_ITEMS } from "@/config/header";
import { useAdvertisingBarScroll } from "@/hooks/useAdvertisingBarScroll";
import { useNoticeTicker } from "@/hooks/useNoticeTicker";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { isScrolled } = useAdvertisingBarScroll();
  const notice = useNoticeTicker(HEADER_NOTICE_ITEMS);

  return (
    <header
      className={
        isHome ? "fixed inset-x-0 top-0 z-50" : "sticky inset-x-0 top-0 z-50"
      }
    >
      <AdvertisingBar
        items={HEADER_NOTICE_ITEMS}
        isCollapsed={isScrolled}
        currentIdx={notice.currentIdx}
        nextIdx={notice.nextIdx}
        isTransitioning={notice.isTransitioning}
      />
      <MainNavBar isHome={isHome} isScrolled={isScrolled} />
    </header>
  );
}
