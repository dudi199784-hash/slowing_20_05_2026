"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { login } from "../lib/api/members";
import { parseBackendAccessTokenBody } from "@/lib/auth/parseBackendAccessTokenBody";
import { clearSession, setAuthSession, syncAuthPresenceCookie } from "@/lib/auth/session";

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forceLogin, setForceLogin] = useState(false);
  const [showForceOption, setShowForceOption] = useState(false);

  /** proxy용 쿠키만 localStorage 와 맞춤. 토큰이 남아 있다고 `/` 로 보내지 않음(만료·깨진 토큰 시 로그인 불가 버그 방지). */
  useEffect(() => {
    clearSession();
    syncAuthPresenceCookie();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setShowForceOption(false);
    setLoading(true);
    try {
      const trimmedId = userId.trim();
      const data = await login({
        userId: trimmedId,
        password,
        force: forceLogin,
      });
      if (data.memberDto.userId !== trimmedId) {
        throw new Error("서버에서 내려준 아이디가 입력과 다릅니다. 다시 시도해 주세요.");
      }
      const claims = parseBackendAccessTokenBody(data.accessToken);
      if (claims) {
        if (claims.id !== data.memberDto.id) {
          throw new Error("토큰과 회원 정보가 맞지 않습니다. 다시 로그인해 주세요.");
        }
        if (claims.userId != null && claims.userId !== trimmedId) {
          throw new Error("토큰의 로그인 아이디가 입력과 다릅니다. 다시 로그인해 주세요.");
        }
      }
      if (!Number.isFinite(Number(data.memberDto.id))) {
        throw new Error("회원 정보(id)가 없습니다. 다시 로그인해 주세요.");
      }
      setAuthSession(data);
      const name = data.memberDto.username?.trim() || trimmedId;
      window.alert(`${name}님, 로그인되었습니다.`);
      router.replace("/");
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { detail?: string } };
      };
      const status = ax.response?.status;
      const detail = ax.response?.data?.detail;
      if (status === 409) {
        setShowForceOption(true);
        setError(
          detail ??
            "다른 기기 또는 브라우저에서 이미 로그인되어 있습니다.",
        );
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : detail ?? "로그인 실패";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-[family-name:var(--font-brand-serif)] text-2xl font-medium tracking-wide">
        로그인
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        이미지 생성·저장 등 회원 기능은 로그인 후 이용할 수 있습니다.
      </p>
      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="text-sm font-medium text-neutral-800">
          아이디
          <input
            className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-neutral-900 focus:ring-2"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="text-sm font-medium text-neutral-800">
          비밀번호
          <input
            type="password"
            className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-neutral-900 focus:ring-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {showForceOption ? (
          <label className="flex items-start gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={forceLogin}
              onChange={(e) => setForceLogin(e.target.checked)}
            />
            <span>
              다른 기기 로그아웃 후 이 기기에서 로그인
              <span className="mt-0.5 block text-xs text-neutral-500">
                선택하면 기존 브라우저·기기의 로그인은 종료됩니다.
              </span>
            </span>
          </label>
        ) : null}
        <button
          type="submit"
          disabled={loading || (showForceOption && !forceLogin)}
          className="rounded bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "처리 중…" : showForceOption ? "로그인 (기존 세션 종료)" : "로그인"}
        </button>
      </form>
      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-8 text-sm text-neutral-600">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-medium text-neutral-900 underline-offset-4 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
