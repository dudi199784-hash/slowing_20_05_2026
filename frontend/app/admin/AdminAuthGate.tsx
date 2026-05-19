"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getAccessToken, getMemberSession, isAdminSession } from "@/lib/auth/session";

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const member = getMemberSession();
    if (!token || !isAdminSession(member)) {
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className="px-6 py-16 text-center text-sm text-neutral-600">
        관리자 권한을 확인하는 중입니다…
      </div>
    );
  }

  return <>{children}</>;
}
