export type CartItemPlaceholder = {
  id: number;
  title: string;
  subtitle?: string;
  /** 래퍼런스(`/shop/custom/[productId]`) 링크용 — 없으면 `id` 사용 */
  productId?: number;
  /** 저장된 로고/유니폼 미리보기 */
  imageUrl?: string;
};
