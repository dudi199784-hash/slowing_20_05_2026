import Link from "next/link";
import ProductCreateForm from "./ProductCreateForm";

export default function AdminProductsNewPage() {
  return (
    <div>
      <p>
        <Link href="/admin/products">← 목록</Link>
      </p>
      <h1>상품 등록</h1>
      <ProductCreateForm />
    </div>
  );
}
