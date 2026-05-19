/** 상단 광고(티커) 문구 — `config/media.ts`처럼 한곳에서만 수정 */
export const HEADER_NOTICE_ITEMS = [
  "( 한정 수량 ) 지금 구매서 windy 굿즈 증정 !",
  "오픈카톡상담 24시간",
  "단체 주문 할인율 (~50%)",
] as const;

export const HEADER_NOTICE_INTERVAL_MS = 1750;
export const HEADER_NOTICE_SETTLE_MS = 650;

/** 광고 바 접힘: 스크롤 히스테리시스 + 쿨다운 */
export const HEADER_SCROLL_HIDE_Y = 1;
export const HEADER_SCROLL_SHOW_Y = 0;
export const HEADER_SCROLL_TOGGLE_COOLDOWN_MS = 220;
