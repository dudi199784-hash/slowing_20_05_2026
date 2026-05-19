/**
 * 백엔드 `JwtProvider.genToken`: JWT payload 의 `body` 클레임에 JSON 문자열로
 * `{ id, username, userId, role }` 가 들어 있습니다.
 */
export type BackendJwtBodyClaims = {
  id: number;
  /** 회원 이름(표시용) */
  username?: string;
  /** 로그인 아이디 */
  userId?: string;
  role?: string;
};

export function parseBackendAccessTokenBody(accessToken: string): BackendJwtBodyClaims | null {
  try {
    const segment = accessToken.split(".")[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const outer = JSON.parse(atob(padded)) as { body?: unknown };
    if (typeof outer.body !== "string") return null;
    const inner = JSON.parse(outer.body) as Record<string, unknown>;
    const id = Number(inner.id);
    if (!Number.isFinite(id)) return null;
    const username = inner.username != null ? String(inner.username) : undefined;
    const userId = inner.userId != null ? String(inner.userId) : undefined;
    const role = inner.role != null ? String(inner.role) : undefined;
    return { id, username, userId, role };
  } catch {
    return null;
  }
}
