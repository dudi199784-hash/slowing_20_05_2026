"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Member } from "../../../lib/api/members";
import { deleteMember, updateMember } from "../../../lib/api/members";
import Link from "next/link";

type Props = { member: Member };

export default function MemberEditForm({ member }: Props) {
  const router = useRouter();
  const [username, setUsername] = useState(member.username);
  const [userId, setUserId] = useState(member.userId);
  const [userpassword, setUserpassword] = useState(member.userpassword ?? "");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await updateMember(member.id, { username, userId, userpassword });
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!globalThis.confirm("해당 회원을 탈퇴할까요?")) return;
    setPending(true);
    try {
      await deleteMember(member.id);
      router.push("/admin/members");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">이름</label>
        <input
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="userId">아이디</label>
        <textarea
          id="userId"
          name="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          rows={4}
        />
      </div>
      <div>
        <label htmlFor="userpassword">비밀번호</label>
        <input
          id="userpassword"
          name="userpassword"
          value={userpassword}
          onChange={(e) => setUserpassword(e.target.value)}
          type="password"
        />
      </div>
      <p>
        <button type="submit" disabled={pending}>
          {pending ? "저장 중…" : "저장"}
        </button>
      </p>
      <p>
        <button type="button" disabled={pending} onClick={handleDelete}>
          삭제
        </button>
      </p>
      <div>
        <Link href={`/members/${member.id}/cart`}>장바구니</Link>
      </div>
    </form>
  );
}
