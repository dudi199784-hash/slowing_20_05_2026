"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createDesign } from "@/app/lib/api/design";

export default function DesignCreateForm() {
  const router = useRouter();
  const memberSerial = 1; // 0 is fixed for admin context
  const productSerial = 1; // 0 is fixed for admin context
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [designTitle, setDesignTitle] = useState("");
  const [designDescription, setDesignDescription] = useState("");
  const [designCategory, setDesignCategory] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await createDesign({
        memberSerial,
        productSerial,
        username,
        title,
        designTitle,
        designDescription,
        designCategory,
      });
      router.push("/admin/designs");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="memberSerial">회원 시리얼</label>
        <input
          id="memberSerial"
          name="memberSerial"
          type="number"
          value={memberSerial}
          readOnly
          required
        />
      </div>
      <div>
        <label htmlFor="productSerial">상품 시리얼</label>
        <input
          id="productSerial"
          name="productSerial"
          type="number"
          value={productSerial}
          readOnly
          required
        />
      </div>
      <div>
        <label htmlFor="username">제작자</label>
        <input
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="title">상품모델명</label>
        <input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="designTitle">디자인 제목</label>
        <input
          id="designTitle"
          name="designTitle"
          value={designTitle}
          onChange={(e) => setDesignTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="designDescription">디자인 설명</label>
        <textarea
          id="designDescription"
          name="designDescription"
          value={designDescription}
          onChange={(e) => setDesignDescription(e.target.value)}
          required
          rows={4}
        />
      </div>
      <div>
        <label htmlFor="designCategory">상품 카테고리</label>
        <input
          id="designCategory"
          name="designCategory"
          value={designCategory}
          onChange={(e) => setDesignCategory(e.target.value)}
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