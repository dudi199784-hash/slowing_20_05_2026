"use client";

import { useRouter } from "next/navigation";
import type { Design } from "../../lib/api/design";
import { deleteDesign } from "../../lib/api/design";
import Link from "next/link";

type Props = { design: Design };

export default function DesignAdminRow({ design }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!globalThis.confirm("해당 디자인을 삭제할까요?")) return;
    await deleteDesign(design.id);
    router.refresh();
  };

  return (
    <div>
      <h2>{design.designTitle}</h2>
      <p>{design.designDescription}</p>
      <p>유저: {design.username}</p>
      <p>상품: {design.title}</p>
      <p>카테고리: {design.designCategory}</p>
      <p>
        <Link href={`/admin/designs/${design.id}`}>수정</Link>{" "}
        <button type="button" onClick={handleDelete}>
          삭제
        </button>
      </p>
      <hr />
    </div>
  );
}
