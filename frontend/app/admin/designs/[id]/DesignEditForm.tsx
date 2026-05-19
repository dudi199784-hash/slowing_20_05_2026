"use client";

import type { Design } from "@/app/lib/api/design";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteDesign, updateDesign } from "@/app/lib/api/design";

type Props = { design: Design };

export default function DesignEditForm({ design }: Props) {
  const router = useRouter();
  const [designTitle, setDesignTitle] = useState(design.designTitle);
  const [designDescription, setDesignDescription] = useState(design.designDescription);
  const [designCategory, setDesignCategory] = useState(design.designCategory);
  const [username, setUsername] = useState(design.username);
  const [title, setTitle] = useState(design.title);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await updateDesign(design.id, {
        memberSerial: design.memberSerial,
        productSerial: design.productSerial,
        username,
        title,
        designTitle,
        designDescription,
        designCategory,
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!globalThis.confirm("이 디자인을 삭제할까요?")) return;
    setPending(true);
    try {
      await deleteDesign(design.id);
      router.push("/admin/designs");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} >
      <div>
        <label htmlFor="title">제목</label>
        <input
          id="title"
          name="title"
          value={designTitle}
          onChange={(e) => setDesignTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="description">설명</label>
        <textarea
          id="description"
          name="description"
          value={designDescription}
          onChange={(e) => setDesignDescription(e.target.value)}
          rows={4}
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
        <label htmlFor="productTitle">상품모델명</label>
        <input
          id="productTitle"
          name="productTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="productCategory">상품 카테고리</label>
        <input
          id="productCategory"
          name="productCategory"
          value={designCategory}
          onChange={(e) => setDesignCategory(e.target.value)}
          required
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
    </form>
  );
}
