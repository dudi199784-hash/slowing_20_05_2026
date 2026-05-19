export type MemberDesignPreview = {
  id: number;
  /** 공개 로고 에셋 id — 구경하기 상세 링크용 */
  assetId: number;
  /** 디자인이 연결된 상품 id — 장바구니 담기 API 에 필요 */
  productId: number;
  title: string;
  author: string;
  category: "로고" | "유니폼" | "기타";
  viewsDisplay: string;
  likesDisplay: string;
  imageUrl: string;
  browseHref: string;
};
