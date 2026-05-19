"use client";

import { useRouter } from "next/navigation";
import type { Product } from "../../lib/api/products";
import { deleteProduct } from "../../lib/api/products";
import Link from "next/link";

type Props = { product: Product };

export default function ProductAdminRow({ product }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!globalThis.confirm("이 상품을 삭제할까요?")) return;
    await deleteProduct(product.id);
    router.refresh();
  };

  return (
    <div>
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <p>{product.category}</p>
      <p>
        <Link href={`/admin/products/${product.id}`}>수정</Link>{" "}
        <button type="button" onClick={handleDelete}>
          삭제
        </button>
      </p>
      <hr />
    </div>
  );
}
