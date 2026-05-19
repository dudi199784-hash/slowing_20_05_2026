export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-3xl bg-white px-6 py-16 text-neutral-900 md:px-10 md:py-20">
      <h1 className="text-3xl font-semibold tracking-wide">고객센터 / 문의</h1>
      <p className="mt-3 text-sm text-neutral-600">운영시간: 평일 10:00-18:00 (점심 12:30-13:30)</p>
      <div className="mt-8 rounded-lg border border-neutral-200 p-6 text-sm">
        <p>이메일: support@chunchunhee.com</p>
        <p className="mt-2">전화: 02-123-4567</p>
        <p className="mt-2">카카오톡 채널: @chunchunhee</p>
      </div>
    </main>
  );
}
