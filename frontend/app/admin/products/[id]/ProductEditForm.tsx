"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "../../../lib/api/products";
import { deleteProduct, updateProduct } from "../../../lib/api/products";

type Props = { product: Product };

export default function ProductEditForm({ product }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [category, setCategory] = useState(product.category);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await updateProduct(product.id, { title, description, category });
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!globalThis.confirm("이 상품을 삭제할까요?")) return;
    setPending(true);
    try {
      await deleteProduct(product.id);
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
