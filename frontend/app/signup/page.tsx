"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createMember } from "../lib/api/members";
import { clearSession } from "@/lib/auth/session";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createMember({ username, userId, userpassword: password });
      clearSession();
      window.alert("회원가입이 완료되었습니다. 로그인해 주세요.");
      router.replace("/login");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String(
              (err as { response?: { data?: { detail?: string } } }).response?.data
                ?.detail ?? "회원가입 실패",
            )
          : "회원가입 실패";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-[family-name:var(--font-brand-serif)] text-2xl font-medium tracking-wide">
        회원가입
      </h1>
      <p className="mt-2 text-sm text-neutral-600">일반 회원으로 가입됩니다.</p>
      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="text-sm font-medium text-neutral-800">
          이름
          <input
            className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-neutral-900 focus:ring-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="name"
            required
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
          />
        </label>
        <label className="text-sm font-medium text-neutral-800">
          비밀번호
          <input
            type="password"
            className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-neutral-900 focus:ring-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "처리 중…" : "가입하기"}
        </button>
      </form>
      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-8 text-sm text-neutral-600">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-neutral-900 underline-offset-4 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
