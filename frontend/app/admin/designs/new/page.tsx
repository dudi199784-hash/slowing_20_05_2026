import Link from "next/link";
import DesignCreateForm from "./DesignCreateForm";

export default function AdminDesignsNewPage() {
  return (
    <div>
      <p>
        <Link href="/admin/designs">← 목록</Link>
      </p>
      <h1>디자인 등록</h1>
      <DesignCreateForm />
    </div>
  );
}
