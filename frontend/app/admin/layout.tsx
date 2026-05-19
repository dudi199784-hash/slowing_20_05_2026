import type { Metadata } from "next";

import AdminAuthGate from "./AdminAuthGate";
import AdminComponent from "./AdminComponent";

export const metadata: Metadata = {
  title: "Admin",
  description: "관리자",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminAuthGate>
      <div className="bg-neutral-50 px-4 py-6 text-neutral-900 md:px-8">
        <p className="mb-2 text-xs uppercase tracking-wider text-neutral-500">Admin</p>
        <AdminComponent />
        <hr className="my-4 border-neutral-200" />
        {children}
      </div>
    </AdminAuthGate>
  );
}
