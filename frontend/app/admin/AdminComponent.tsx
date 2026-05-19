import Link from "next/link";

export default function AdminComponent() {
  return (
    <nav>
      <Link href="/admin">Admin</Link><br />
      <Link href="/admin/products">Products</Link><br />
      <Link href="/admin/orders">Orders</Link><br />
      <Link href="/admin/members">Members</Link><br />
      <Link href="/admin/designs">Design</Link><br />
      <Link href="/admin/community">Community</Link><br />
      <Link href="/admin/cart">Cart</Link><br />
      <Link href="/login">로그인 (관리자)</Link>
      <br />
    </nav>
  );
}