"use client";

import { useCallback, useEffect } from "react";

import { fetchSessionStatus } from "@/app/lib/api/members";
import { ACCESS_TOKEN_KEY, AUTH_CHANGED_EVENT } from "@/lib/auth/constants";
import {
  clearSession,
  getAccessToken,
  reconcileAuthSessionFromServer,
  syncAuthPresenceCookie,
} from "@/lib/auth/session";

/**
 * 쿠키 동기화 + 서버 세션 검증.
 * 다른 브라우저에서 재로그인하면 이전 기기 토큰은 무효 → localStorage 정리.
 */
export default function AuthPresenceCookieSync() {
  const reconcile = useCallback(async () => {
    try {
      sessionStorage.removeItem("cc_studio_logo_for_uniform");
    } catch {
      /* ignore */
    }
    syncAuthPresenceCookie();
    const token = getAccessToken();
    if (!token) return;
    const result = await fetchSessionStatus();
    if (!result.ok) {
      if (result.reason === "unauthorized") {
        clearSession();
      }
      return;
    }
    const status = result.data;
    if (!status.valid) {
      clearSession();
      return;
    }
    if (!reconcileAuthSessionFromServer(status)) {
      return;
    }
  }, []);

  useEffect(() => {
    void reconcile();
    const onAuth = () => void reconcile();
    const onFocus = () => void reconcile();
    const onStorage = (e: StorageEvent) => {
      if (e.key === ACCESS_TOKEN_KEY) void reconcile();
    };
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    const interval = window.setInterval(() => void reconcile(), 60_000);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, [reconcile]);

  return null;
}
