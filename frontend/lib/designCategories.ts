export type DesignCategoryLabel =
  | "로고"
  | "유니폼"
  | "축구화"
  | "키퍼장갑"
  | "스포츠용품"
  | "기타";

/** logo_asset.category · product.category 등 통일 */
export function normalizeDesignCategory(
  raw: string | undefined,
): DesignCategoryLabel {
  if (raw == null) return "기타";
  const t = raw.trim();
  if (
    t === "로고" ||
    t === "유니폼" ||
    t === "축구화" ||
    t === "키퍼장갑" ||
    t === "스포츠용품" ||
    t === "기타"
  ) {
    return t;
  }
  const lower = t.toLowerCase();
  if (lower === "logo") return "로고";
  if (lower === "uniform" || lower.includes("uniform")) return "유니폼";
  if (lower === "cleats" || lower.includes("cleat") || t.includes("축구화"))
    return "축구화";
  if (lower.includes("keeper") || lower.includes("glove") || t.includes("키퍼"))
    return "키퍼장갑";
  if (lower.includes("sport") || t.includes("스포츠")) return "스포츠용품";
  if (lower === "etc" || lower === "other") return "기타";
  return "기타";
}

/** 쇼핑백 — 유니폼·기타 시안만. 로고 이미지는 제외 */
export function isCartableDesignCategory(category: string | undefined): boolean {
  return normalizeDesignCategory(category) !== "로고";
}
