"use client";

import { useRouter } from "next/navigation";
import type { Member } from "../../lib/api/members";
import { deleteMember } from "../../lib/api/members";
import Link from "next/link";

type Props = { member: Member };

export default function MemberAdminRow({ member }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!globalThis.confirm("해당 회원을 탈퇴할까요?")) return;
    await deleteMember(member.id);
    router.refresh();
  };

  return (
    <div>
      <h2>{member.username}</h2>
      <p>{member.userId}</p>
      <p>{member.createTime}</p>
      <p>
        <Link href={`/admin/members/${member.id}`}>수정</Link>{" "}
        <button type="button" onClick={handleDelete}>
          삭제
        </button>
      </p>
      <hr />
    </div>
  );
}
