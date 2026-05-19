import Link from "next/link";

export default function UserHomePage() {
  return (
    <main className="mx-auto w-full max-w-3xl bg-white px-6 py-16 text-neutral-900 md:px-10 md:py-20">
      <h1 className="text-3xl font-semibold tracking-wide">사용자 센터</h1>
      <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
        <Link href="/login" className="rounded-md border border-neutral-200 px-4 py-3 hover:bg-neutral-50">로그인</Link>
        <Link href="/signup" className="rounded-md border border-neutral-200 px-4 py-3 hover:bg-neutral-50">회원가입</Link>
        <Link href="/user/mypage" className="rounded-md border border-neutral-200 px-4 py-3 hover:bg-neutral-50">마이페이지</Link>
        <Link href="/user/designs" className="rounded-md border border-neutral-200 px-4 py-3 hover:bg-neutral-50">내 디자인</Link>
        <Link href="/user/orders" className="rounded-md border border-neutral-200 px-4 py-3 hover:bg-neutral-50">주문내역</Link>
      </div>
    </main>
  );
}
