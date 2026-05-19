"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createProduct } from "../../../lib/api/products";

export default function ProductCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await createProduct({ title, description, category });
      router.push("/admin/products");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">제목</label>
        <input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="description">설명</label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
        />
      </div>
      <div>
        <label htmlFor="category">카테고리</label>
        <input
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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
