"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AUTH_CHANGED_EVENT } from "@/lib/auth/constants";
import { canAccessProtectedRoutes } from "@/lib/auth/session";

type AddToCartConfirmDialogProps = {
  open: boolean;
  productTitle: string;
  onClose: () => void;
};

export default function AddToCartConfirmDialog({
  open,
  productTitle,
  onClose,
}: AddToCartConfirmDialogProps) {
  const [cartHref, setCartHref] = useState("/login");

  useEffect(() => {
    const sync = () =>
      setCartHref(canAccessProtectedRoutes() ? "/cart" : "/login");
    sync();
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, sync);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-cart-dialog-title"
      >
        <h2
          id="add-to-cart-dialog-title"
          className="text-lg font-semibold text-neutral-900"
        >
          쇼핑백에 추가됨
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          <span className="font-medium text-neutral-800">{productTitle}</span>을(를)
          쇼핑백에 담았습니다. 쇼핑백으로 이동할까요?
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
          >
            계속 둘러보기
          </button>
          <Link
            href={cartHref}
            onClick={onClose}
            className="rounded-lg bg-neutral-900 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            쇼핑백으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
