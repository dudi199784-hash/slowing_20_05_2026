"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import MenuDropdown from "@/components/header/MenuDropdown";
import { AUTH_CHANGED_EVENT } from "@/lib/auth/constants";
import { logoutMember } from "@/app/lib/api/members";
import { clearSession, getAccessToken, getMemberSession } from "@/lib/auth/session";

type UserMenuProps = {
  onClose?: () => void;
};

export default function UserMenu({ onClose }: UserMenuProps) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [label, setLabel] = useState("");

  const refresh = useCallback(() => {
    const token = getAccessToken();
    const member = getMemberSession();
    setLoggedIn(Boolean(token && member));
    const uid = member?.userId ?? "";
    const name = member?.username?.trim();
    setLabel(name && uid ? `${name} (${uid})` : uid);
  }, []);

  useEffect(() => {
    refresh();
    const onAuth = () => refresh();
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
  }, [refresh]);

  if (loggedIn) {
    return (
      <MenuDropdown
        onClose={onClose}
        items={[
          { label: label ? `안녕하세요, ${label}` : "마이페이지", href: "/user/mypage" },
          { label: "내 디자인", href: "/user/designs" },
          { label: "주문내역", href: "/user/orders" },
          {
            label: "로그아웃",
            onPress: () => {
              void (async () => {
                onClose?.();
                try {
                  await logoutMember();
                } catch {
                  /* 토큰 만료 등 — 로컬은 항상 정리 */
                }
                clearSession();
                window.alert("로그아웃되었습니다.");
                router.replace("/login");
              })();
            },
          },
        ]}
      />
    );
  }

  return (
    <MenuDropdown
      onClose={onClose}
      items={[
        { label: "로그인", href: "/login" },
        { label: "회원가입", href: "/signup" },
        { label: "마이페이지", href: "/login" },
        { label: "주문내역", href: "/login" },
      ]}
    />
  );
}
