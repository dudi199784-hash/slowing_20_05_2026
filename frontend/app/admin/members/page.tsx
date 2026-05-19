import { getMembers } from "../../lib/api/members";
import MemberAdminRow from "./MemberAdminRow";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const { members } = await getMembers();

  return (
    <div>
      <h1>Admin Members</h1> 
      <Link href="/admin/members/new">신규회원 원격등록</Link>
      {members.map((member) => (
        <MemberAdminRow key={member.id} member={member} />
      ))}
    </div>
  );
}
