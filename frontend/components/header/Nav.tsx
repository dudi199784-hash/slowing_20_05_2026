"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import UserMenu from "@/components/toggle/UserMenu";
import Menu from "@/components/toggle/Menu";
import { AUTH_CHANGED_EVENT } from "@/lib/auth/constants";
import { canAccessProtectedRoutes } from "@/lib/auth/session";

type NavProps = {
  /** 홈 히어로 위 투명 헤더 — 로고와 동일하게 흰색 */
  variant?: "overlay" | "default";
};

const navLabelClass = (overlay: boolean) =>
  `shrink-0 text-xs font-medium tracking-wide transition-colors duration-500 sm:text-sm ${
    overlay
      ? "text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)] hover:text-white/90"
      : "text-neutral-900 hover:text-neutral-600"
  }`;

/**
 * 쇼핑백 · 멤버 · 메뉴 — 텍스트 라벨.
 */
export default function Nav({ variant = "default" }: NavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<"user" | "menu" | null>(null);
  const [cartHref, setCartHref] = useState("/login");

  const overlay = variant === "overlay";

  const syncCartHref = useCallback(() => {
    setCartHref(canAccessProtectedRoutes() ? "/cart" : "/login");
  }, []);

  useEffect(() => {
    syncCartHref();
    window.addEventListener(AUTH_CHANGED_EVENT, syncCartHref);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, syncCartHref);
  }, [syncCartHref]);

  const toggleMenu = (type: "user" | "menu") => {
    setIsMenuOpen((prev) => (prev === type ? null : type));
  };

  const closeMenu = () => setIsMenuOpen(null);

  const linkClass = `bg-transparent ${navLabelClass(overlay)}`;
  const buttonClass = `cursor-pointer bg-transparent ${navLabelClass(overlay)}`;

  return (
    <nav
      className={`relative flex shrink-0 flex-none flex-nowrap items-center justify-end gap-4 md:gap-5 ${
        isMenuOpen ? "z-[61]" : ""
      }`}
      aria-label="계정 및 메뉴"
    >
      <Link href="/shop/browse" className={linkClass}>
        구경하기
      </Link>
      <Link href={cartHref} className={linkClass}>
        쇼핑백
      </Link>
      <button
        type="button"
        onClick={() => toggleMenu("user")}
        className={buttonClass}
        aria-expanded={isMenuOpen === "user"}
      >
        멤버
      </button>
      <button
        type="button"
        onClick={() => toggleMenu("menu")}
        className={buttonClass}
        aria-expanded={isMenuOpen === "menu"}
      >
        메뉴
      </button>

      {isMenuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[50] cursor-default bg-black/20"
          aria-label="메뉴 닫기"
          onClick={closeMenu}
        />
      ) : null}
      {isMenuOpen === "menu" ? <Menu onClose={closeMenu} /> : null}
      {isMenuOpen === "user" ? <UserMenu onClose={closeMenu} /> : null}
    </nav>
  );
}
