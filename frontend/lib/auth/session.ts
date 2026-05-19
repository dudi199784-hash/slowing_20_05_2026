import {
  ACCESS_TOKEN_KEY,
  AUTH_CHANGED_EVENT,
  AUTH_PRESENCE_COOKIE_NAME,
  MEMBER_SESSION_KEY,
} from "./constants";
import { parseBackendAccessTokenBody } from "./parseBackendAccessTokenBody";
import type { MemberSession } from "./types";

export function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
}

/** 백엔드 액세스 토큰 TTL 과 맞춤 (`MemberService.authAndMakeTokens`) */
const AUTH_PRESENCE_MAX_AGE_SEC = 60 * 60 * 5;

/** API·쇼핑백 등 — JWT 회원 id 우선 (서버와 동일 기준) */
export function getCurrentMemberId(): number | null {
  const token = getAccessToken();
  if (token) {
    const claims = parseBackendAccessTokenBody(token);
    if (claims && Number.isFinite(claims.id)) return claims.id;
  }
  const member = getMemberSession();
  if (member && Number.isFinite(member.id)) return member.id;
  return null;
}

function resolveMemberIdForPresence(): number | null {
  return getCurrentMemberId();
}

/** Nav·proxy 와 동일: 토큰 + 회원 id 가 있을 때만 보호 경로(쇼핑백 등) 통과 */
export function canAccessProtectedRoutes(): boolean {
  return Boolean(getAccessToken() && resolveMemberIdForPresence() != null);
}

export function syncAuthPresenceCookie(): void {
  if (typeof document === "undefined") return;
  /** accessToken 만 남은 비정상 상태에서는 쿠키를 주지 않음 → proxy 가 /cart 등을 막음 */
  const token = getAccessToken();
  const memberId = resolveMemberIdForPresence();
  if (token && memberId != null) {
    document.cookie = `${AUTH_PRESENCE_COOKIE_NAME}=1; Path=/; Max-Age=${AUTH_PRESENCE_MAX_AGE_SEC}; SameSite=Lax`;
  } else {
    document.cookie = `${AUTH_PRESENCE_COOKIE_NAME}=; Path=/; Max-Age=0`;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getMemberSession(): MemberSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(MEMBER_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MemberSession;
  } catch {
    return null;
  }
}

export function setAuthSession(data: { accessToken: string; memberDto: MemberSession }) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  window.localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(data.memberDto));
  syncAuthPresenceCookie();
  notifyAuthChanged();
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(MEMBER_SESSION_KEY);
  syncAuthPresenceCookie();
  notifyAuthChanged();
}

export function isAdminSession(member: MemberSession | null): boolean {
  return member?.role === "ADMIN";
}

/** 토큰(JWT)과 localStorage 회원 정보가 같은 계정인지 */
export function isAuthSessionConsistent(): boolean {
  const token = getAccessToken();
  const member = getMemberSession();
  if (!token || !member?.userId) return false;
  const claims = parseBackendAccessTokenBody(token);
  if (!claims) return false;
  return claims.id === member.id && claims.userId === member.userId;
}

/** 서버 세션 응답으로 localStorage 회원 정보를 맞춤. false 면 로그아웃 처리 필요 */
export function reconcileAuthSessionFromServer(server: {
  memberId: number;
  userId: string;
}): boolean {
  const token = getAccessToken();
  if (!token) return false;
  const claims = parseBackendAccessTokenBody(token);
  if (!claims || claims.id !== server.memberId || claims.userId !== server.userId) {
    clearSession();
    return false;
  }
  const member = getMemberSession();
  if (
    !member ||
    member.id !== server.memberId ||
    member.userId !== server.userId
  ) {
    setAuthSession({
      accessToken: token,
      memberDto: {
        id: server.memberId,
        userId: server.userId,
        username: member?.username ?? claims.username,
        role: member?.role ?? (claims.role as MemberSession["role"]),
      },
    });
  }
  return true;
}
