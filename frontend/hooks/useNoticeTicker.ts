import { useEffect, useState } from "react";

import {
  HEADER_NOTICE_INTERVAL_MS,
  HEADER_NOTICE_SETTLE_MS,
} from "@/config/header";

/**
 * 광고 문구 순환. `items` 길이가 0이면 아무 것도 하지 않음.
 */
export function useNoticeTicker(items: readonly string[]) {
  const len = items.length;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(len > 1 ? 1 : 0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (len < 2) return;

    const intervalId = window.setInterval(() => {
      setNextIdx((currentIdx + 1) % len);
      setIsTransitioning(true);
    }, HEADER_NOTICE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [currentIdx, len]);

  useEffect(() => {
    if (!isTransitioning || len < 2) return;

    const timeoutId = window.setTimeout(() => {
      setCurrentIdx(nextIdx);
      setIsTransitioning(false);
    }, HEADER_NOTICE_SETTLE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isTransitioning, nextIdx, len]);

  return { currentIdx, nextIdx, isTransitioning };
}
