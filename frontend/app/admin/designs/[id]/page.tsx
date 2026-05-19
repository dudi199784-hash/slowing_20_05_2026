import { getDesign } from "@/app/lib/api/design";
import DesignEditForm from "./DesignEditForm";
import { notFound } from "next/navigation";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminDesignDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId) || numId < 1) {
    notFound();
  }
  const design = await getDesign(numId);
  return (
    <div>
      <p>
        <Link href="/admin/designs">← 목록</Link>
      </p>
      <h1>디자인 수정</h1>
      <DesignEditForm design={design} />
    </div>
  );
}
