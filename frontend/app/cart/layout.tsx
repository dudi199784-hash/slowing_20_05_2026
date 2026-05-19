"use client";

import UserAuthGate from "@/components/auth/UserAuthGate";

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <UserAuthGate>{children}</UserAuthGate>;
}
