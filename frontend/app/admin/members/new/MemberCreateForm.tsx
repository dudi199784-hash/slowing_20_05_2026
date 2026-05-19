"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createMember } from "../../../lib/api/members";

export default function MemberCreateForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [userpassword, setUserpassword] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await createMember({ username, userId, userpassword });
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
          required
        />
      </div>
      <p>
        <button type="submit" disabled={pending}>
          {pending ? "등록 중…" : "등록"}
        </button>
      </p>
    </form>
  );
}
