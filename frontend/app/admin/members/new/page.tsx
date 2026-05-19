import Link from "next/link";
import MemberCreateForm from "./MemberCreateForm";

export default function AdminMembersNewPage() {
  return (
    <div>
      <p>
        <Link href="/admin/members">← 목록</Link>
      </p>
      <h1>상품 등록</h1>
      <MemberCreateForm />
    </div>
  );
}
