import Link from "next/link";
import { notFound } from "next/navigation";
import { getMember } from "../../../lib/api/members";
import MemberEditForm from "./MemberEditForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminMemberDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId) || numId < 1) {
    notFound(); 
  }
  const { member } = await getMember(numId);
  return (
    <div>
      <p>
        <Link href="/admin/members">← 목록</Link>
      </p>
      <h1>회원 수정</h1>
      <MemberEditForm member={member} />
    </div>
  );
}
