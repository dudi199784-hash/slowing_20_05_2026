import type { DesignCategoryLabel } from "@/lib/designCategories";

import { http } from "./http";
import { fetchApiJson } from "@/lib/api/fetchJson";
import { parseBackendAccessTokenBody } from "@/lib/auth/parseBackendAccessTokenBody";
import { getAccessToken, getMemberSession } from "@/lib/auth/session";

export type DesignCategory = DesignCategoryLabel;
export type LogoAssetVisibility = "PRIVATE" | "PUBLIC";

export interface SaveLogoAssetBody {
  prompt: string;
  b64Png: string;
  category?: DesignCategory;
}

export interface SaveLogoAssetResponse {
  id: number;
  accessPath: string;
  category?: DesignCategory;
  designId?: number | null;
  productId?: number | null;
}

export interface LogoAssetItem {
  id: number;
  prompt: string;
  accessPath: string;
  category: DesignCategory | string;
  designId: number | null;
  productId: number | null;
  createdAt: string;
  visibility: LogoAssetVisibility;
  viewCount: number;
  likeCount: number;
  authorName: string;
  ownerMemberId: number | null;
  ownerUserId: string | null;
  likedByMe: boolean | null;
}

export type MyLogoAssetItem = LogoAssetItem;

export async function saveLogoAsset(
  body: SaveLogoAssetBody,
): Promise<SaveLogoAssetResponse> {
  const res = await http.post<SaveLogoAssetResponse>(
    "/api/v1/logo-assets",
    body,
  );
  return res.data;
}

function filterToCurrentUser(items: LogoAssetItem[]): LogoAssetItem[] {
  const token = getAccessToken();
  const member = getMemberSession();
  const claims = token ? parseBackendAccessTokenBody(token) : null;
  const userId = claims?.userId ?? member?.userId;
  const memberId = claims?.id ?? member?.id;
  if (userId == null && memberId == null) return [];
  return items.filter((item) => {
    if (userId && item.ownerUserId) {
      return item.ownerUserId === userId;
    }
    if (memberId != null && item.ownerMemberId != null) {
      return item.ownerMemberId === memberId;
    }
    return false;
  });
}

export async function fetchMyLogoAssets(): Promise<MyLogoAssetItem[]> {
  const res = await http.get<LogoAssetItem[]>("/api/v1/logo-assets/mine");
  const list = Array.isArray(res.data) ? res.data : [];
  return filterToCurrentUser(list);
}

export async function updateLogoAssetVisibility(
  id: number,
  visibility: LogoAssetVisibility,
): Promise<LogoAssetItem> {
  const res = await http.patch<LogoAssetItem>(
    `/api/v1/logo-assets/${id}/visibility`,
    { visibility },
  );
  return res.data;
}

export async function fetchBrowseLogoAssets(
  category?: string,
): Promise<LogoAssetItem[]> {
  const q =
    category && category !== "전체"
      ? `?category=${encodeURIComponent(category)}`
      : "";
  const token = getAccessToken();
  if (token) {
    const res = await http.get<LogoAssetItem[]>(
      `/api/v1/logo-assets/browse${q}`,
    );
    return Array.isArray(res.data) ? res.data : [];
  }
  const data = await fetchApiJson<LogoAssetItem[]>(
    `/api/v1/logo-assets/browse${q}`,
  );
  return data ?? [];
}

/** 상세 관람 — `countView` 가 true 일 때만 조회수 +1 */
export async function fetchBrowseLogoAsset(
  id: number,
  options?: { countView?: boolean },
): Promise<LogoAssetItem> {
  const countView = options?.countView !== false;
  const q = countView ? "" : "?countView=false";
  const token = getAccessToken();
  if (token) {
    const res = await http.get<LogoAssetItem>(
      `/api/v1/logo-assets/browse/${id}${q}`,
    );
    return res.data;
  }
  const data = await fetchApiJson<LogoAssetItem>(
    `/api/v1/logo-assets/browse/${id}${q}`,
  );
  if (!data) {
    throw new Error("디자인을 찾을 수 없습니다.");
  }
  return data;
}

export async function toggleBrowseLike(id: number): Promise<LogoAssetItem> {
  const res = await http.post<LogoAssetItem>(`/api/v1/logo-assets/${id}/like`);
  return res.data;
}

export function logoAssetImageUrl(accessPath: string): string {
  const base = (http.defaults.baseURL ?? "").replace(/\/$/, "");
  return `${base}${accessPath}`;
}

/** 저장된 로고를 유니폼 시안 API(FormData)용 File 로 변환 */
export async function fetchLogoAssetAsFile(
  accessPath: string,
  fileName = "logo.png",
): Promise<File> {
  const url = logoAssetImageUrl(accessPath);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("로고 이미지를 불러오지 못했습니다.");
  }
  const blob = await res.blob();
  const type = blob.type && blob.type.startsWith("image/") ? blob.type : "image/png";
  return new File([blob], fileName, { type });
}

export function titleFromLogoPrompt(prompt: string): string {
  const line = prompt.trim().split("\n")[0] ?? "디자인";
  return line.length > 80 ? `${line.slice(0, 79)}…` : line;
}

export function formatMetricCount(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString("ko-KR") : "0";
}
