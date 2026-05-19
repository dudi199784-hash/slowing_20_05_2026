import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "../../../lib/api/products";
import ProductEditForm from "./ProductEditForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId) || numId < 1) {
    notFound();
  }

  const { product } = await getProduct(numId);

  return (
    <div>
      <p>
        <Link href="/admin/products">← 목록</Link>
      </p>
      <h1>상품 수정</h1>
      <ProductEditForm product={product} />
    </div>
  );
}
