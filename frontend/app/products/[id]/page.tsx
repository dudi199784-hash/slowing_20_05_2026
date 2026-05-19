import { getProduct } from "../../lib/api/products";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId) || numId < 1) {
    notFound();
  }

  const { product } = await getProduct(numId);
  return (
    <div>
      ProductDetail
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <p>{product.category}</p>
    </div>
  );
}
