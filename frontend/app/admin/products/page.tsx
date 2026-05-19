import { getProducts } from "../../lib/api/products";
import ProductAdminRow from "./ProductAdminRow";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { products } = await getProducts();

  return (
    <div>
      <h1>Admin Products</h1> 
      <Link href="/admin/products/new">상품 추가</Link>
      {products.map((product) => (
        <ProductAdminRow key={product.id} product={product} />
      ))}
    </div>
  );
}
