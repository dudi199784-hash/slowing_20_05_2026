"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import UserAuthGate from "@/components/auth/UserAuthGate";
import { getMember, updateMember } from "@/app/lib/api/members";
import { AUTH_CHANGED_EVENT, MEMBER_SESSION_KEY } from "@/lib/auth/constants";
import {
  getAccessToken,
  getMemberSession,
  notifyAuthChanged,
  syncAuthPresenceCookie,
} from "@/lib/auth/session";
import type { MemberSession } from "@/lib/auth/types";

function AccountInner() {
  const session = getMemberSession();
  const [member, setMember] = useState<MemberSession | null>(session);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(() => session?.userId ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const refreshMember = useCallback(() => {
    setMember(getMemberSession());
  }, []);

  useEffect(() => {
    refreshMember();
    window.addEventListener(AUTH_CHANGED_EVENT, refreshMember);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, refreshMember);
  }, [refreshMember]);

  useEffect(() => {
    const m = getMemberSession();
    if (!m?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const { member: row } = await getMember(m.id);
        if (cancelled) return;
        setUsername(row.username ?? "");
        setUserId((prev) => (row.userId?.trim() ? row.userId.trim() : prev || m.userId));
      } catch {
        if (!cancelled) setError("회원 정보를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [member?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const m = getMemberSession();
    const token = getAccessToken();
    if (!m?.id || !token) return;
    if (newPassword.trim() && newPassword.trim().length < 4) {
      setError("비밀번호를 바꿀 경우 4자 이상 입력해 주세요.");
      return;
    }
    setSaving(true);
    setError("");
    setDone("");
    try {
      await updateMember(m.id, {
        username: username.trim(),
        userId: userId.trim(),
        ...(newPassword.trim() ? { userpassword: newPassword.trim() } : {}),
      });
      setDone("저장했습니다.");
      setNewPassword("");
      const next: MemberSession = { ...m, userId: userId.trim() };
      window.localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(next));
      syncAuthPresenceCookie();
      notifyAuthChanged();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String(
              (err as { response?: { data?: { detail?: string; message?: string } } }).response?.data
                ?.detail ??
                (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                "저장에 실패했습니다.",
            )
          : "저장에 실패했습니다.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-16 text-neutral-900 md:px-10 md:py-20">
      <header className="border-b border-neutral-200 pb-8">
        <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">ACCOUNT</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-wide md:text-4xl">로그인 정보 변경</h1>
        <p className="mt-2 text-sm text-neutral-600">이름·아이디·비밀번호를 수정할 수 있습니다.</p>
      </header>

      {loading ? (
        <p className="mt-6 text-xs text-neutral-500">서버에서 이름·아이디를 확인하는 중입니다.</p>
      ) : null}

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="text-sm font-medium text-neutral-800">
          이름
          <input
            className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-neutral-900 focus:ring-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="name"
            required
            readOnly={loading}
          />
        </label>
        <label className="text-sm font-medium text-neutral-800">
          아이디
          <input
            className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-neutral-900 focus:ring-2"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            autoComplete="username"
            required
            readOnly={loading}
          />
        </label>
        <label className="text-sm font-medium text-neutral-800">
          새 비밀번호
          <input
            type="password"
            className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-neutral-900 focus:ring-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="변경할 때만 입력"
            readOnly={loading}
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {done ? <p className="text-sm text-green-700">{done}</p> : null}
        <button
          type="submit"
          disabled={loading || saving}
          className="mt-2 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "저장 중…" : "저장"}
        </button>
      </form>

      <p className="mt-10 text-sm">
        <Link href="/user/mypage" className="font-medium text-neutral-800 underline">
          ← 마이페이지
        </Link>
      </p>
    </main>
  );
}

export default function AccountPage() {
  return (
    <UserAuthGate>
      <AccountInner />
    </UserAuthGate>
  );
}
