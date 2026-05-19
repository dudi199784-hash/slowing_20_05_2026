"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AUTH_CHANGED_EVENT } from "@/lib/auth/constants";
import { getAccessToken } from "@/lib/auth/session";

type UserAuthGateProps = {
  children: React.ReactNode;
};

export default function UserAuthGate({ children }: UserAuthGateProps) {
  const router = useRouter();
  /** null: 클라이언트에서 토큰 확인 전(로그인 여부와 무관한 첫 프레임) */
  const [allowed, setAllowed] = useState<boolean | null>(null);

  const check = useCallback(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      setAllowed(false);
      return;
    }
    setAllowed(true);
  }, [router]);

  useEffect(() => {
    check();
    const onAuth = () => check();
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
  }, [check]);

  if (allowed === null) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-24 text-center text-sm text-neutral-500 md:px-10">
        접근 권한을 확인하는 중…
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-24 text-center text-sm text-neutral-500 md:px-10">
        로그인 화면으로 이동합니다…
      </div>
    );
  }

  return <>{children}</>;
}
