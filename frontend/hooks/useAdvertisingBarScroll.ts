import { useEffect, useRef, useState } from "react";

import {
  HEADER_SCROLL_HIDE_Y,
  HEADER_SCROLL_SHOW_Y,
  HEADER_SCROLL_TOGGLE_COOLDOWN_MS,
} from "@/config/header";

/**
 * 광고 바 접힘 여부. 레이아웃 변화로 인한 스크롤 토글 루프를 줄이기 위해
 * 히스테리시스 + 짧은 쿨다운을 사용합니다.
 */
export function useAdvertisingBarScroll() {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRafRef = useRef<number | null>(null);
  const isScrolledRef = useRef(false);
  const lastToggleAtRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      if (scrollRafRef.current !== null) return;

      scrollRafRef.current = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const now = performance.now();

        if (now - lastToggleAtRef.current < HEADER_SCROLL_TOGGLE_COOLDOWN_MS) {
          scrollRafRef.current = null;
          return;
        }

        if (!isScrolledRef.current && y > HEADER_SCROLL_HIDE_Y) {
          isScrolledRef.current = true;
          setIsScrolled(true);
          lastToggleAtRef.current = now;
        } else if (isScrolledRef.current && y <= HEADER_SCROLL_SHOW_Y) {
          isScrolledRef.current = false;
          setIsScrolled(false);
          lastToggleAtRef.current = now;
        }
        scrollRafRef.current = null;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  return { isScrolled };
}
