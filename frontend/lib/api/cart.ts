import type { CartItemPlaceholder } from "@/app/cart/types";

import { logoAssetImageUrl } from "@/app/lib/api/logoAssets";
import { http } from "@/app/lib/api/http";
import {
  isCartableDesignCategory,
  normalizeDesignCategory,
  type DesignCategoryLabel,
} from "@/lib/designCategories";
import { getCurrentMemberId, getMemberSession } from "@/lib/auth/session";

/** `ApiV1CartController` 가 반환하는 `CartDto` JSON (배열) */
type CartDto = {
  cartId: number;
  designerId: number;
  customerId: number;
  productId: number;
  customerName: string;
  previewAccessPath?: string | null;
};

type ProductEnvelope = {
  product: { id: number; title: string; category: string };
};

export type CartLine = CartItemPlaceholder & {
  category: DesignCategoryLabel;
  productId: number;
};

function mapProductCategory(raw: string | undefined): CartLine["category"] {
  return normalizeDesignCategory(raw);
}

/**
 * 로그인한 회원의 장바구니. **클라이언트에서만** 호출 (axios Bearer + 세션 id).
 */
export async function fetchCartItems(): Promise<CartLine[]> {
  const memberId = getCurrentMemberId();
  if (memberId == null) return [];

  const res = await http.get<CartDto[]>("/api/v1/carts", {
    params: { user: memberId },
  });
  const rows = Array.isArray(res.data) ? res.data : [];

  const uniqueProductIds = [...new Set(rows.map((r) => r.productId))];
  const meta = new Map<number, { title: string; category: CartLine["category"] }>();

  await Promise.all(
    uniqueProductIds.map(async (pid) => {
      try {
        const { data } = await http.get<ProductEnvelope>(`/api/v1/products/${pid}`);
        if (data?.product) {
          meta.set(pid, {
            title: data.product.title,
            category: mapProductCategory(data.product.category),
          });
        }
      } catch {
        /* 상품 메타 실패 시에도 카트 줄은 title 없이 표시 */
      }
    }),
  );

  return rows
    .map((r) => {
      const m = meta.get(r.productId);
      const preview = r.previewAccessPath?.trim();
      const category = m?.category ?? "기타";
      return {
        id: r.cartId,
        productId: r.productId,
        title: m?.title ?? `상품 #${r.productId}`,
        subtitle: r.customerName,
        category,
        imageUrl: preview ? logoAssetImageUrl(preview) : undefined,
      };
    })
    .filter((line) => isCartableDesignCategory(line.category));
}

export async function fetchCartItemById(
  id: number | string | undefined,
): Promise<CartLine | null> {
  if (id === undefined || id === "") return null;
  const numeric = typeof id === "string" ? Number(id) : id;
  if (!Number.isFinite(numeric)) return null;
  const items = await fetchCartItems();
  return items.find((item) => item.id === numeric) ?? null;
}

/** `POST /api/v1/carts` — 백엔드 `AddCartRequest` 필드명과 맞춤 */
export async function postCartLine(params: {
  designId: number;
  productId: number;
  /** 로고는 담을 수 없음 — UI에서 넘기기 전에 검사 */
  category?: string;
}): Promise<void> {
  if (params.category != null && !isCartableDesignCategory(params.category)) {
    throw new Error(
      "로고 이미지는 쇼핑백에 담을 수 없습니다. 유니폼 시안만 담아 주세요.",
    );
  }
  const memberId = getCurrentMemberId();
  if (memberId == null) {
    throw new Error("로그인이 필요합니다.");
  }
  const member = getMemberSession();
  await http.post("/api/v1/carts", {
    cartId: Date.now(),
    designId: params.designId,
    customerId: memberId,
    productId: params.productId,
    customerName: member?.userId ?? "member",
  });
}
