import DesignAdminRow from "./DesignAdminRow";
import { getDesigns } from "@/app/lib/api/design";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDesignsPage() {
  const { designs } = await getDesigns();
  return (
    <div>
      <h1>Admin Designs</h1>
      <Link href="/admin/designs/new">디자인 추가</Link>
      {designs.map((design) => (
        <DesignAdminRow key={design.id} design={design} />
      ))}
    </div>
  );
}
