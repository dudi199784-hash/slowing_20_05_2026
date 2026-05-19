/**
 * OAuth 연동 전 UI 자리.
 * 버튼에 `data-oauth-provider` 로 백엔드/NextAuth 등에서 구분하기 쉽게 둠.
 */
const PROVIDERS = [
  { id: "apple", label: "Apple로 계속하기", className: "bg-black text-white hover:bg-neutral-800" },
  {
    id: "kakao",
    label: "카카오로 계속하기",
    className: "bg-[#FEE500] text-[#191919] hover:bg-[#f5dc00]",
  },
  {
    id: "google",
    label: "Google로 계속하기",
    className: "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50",
  },
  {
    id: "naver",
    label: "네이버로 계속하기",
    className: "bg-[#03C75A] text-white hover:bg-[#02b351]",
  },
] as const;

export default function SocialLoginSection() {
  return (
    <div className="mt-8">
      <div className="relative flex items-center justify-center py-2">
        <span className="absolute inset-x-0 top-1/2 h-px bg-neutral-200" aria-hidden />
        <span className="relative bg-white px-3 text-xs font-medium tracking-wide text-neutral-500">
          소셜 계정으로 로그인
        </span>
      </div>

      <ul className="mt-6 space-y-3" role="list">
        {PROVIDERS.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              data-oauth-provider={p.id}
              className={`flex w-full items-center justify-center px-4 py-3 text-sm font-medium tracking-wide transition ${p.className}`}
              disabled
              title="API 연동 후 활성화"
            >
              {p.label}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-neutral-400">
        Apple · Kakao · Google · Naver OAuth는 백엔드/리다이렉트 URL 등록 후 연결 예정입니다.
      </p>
    </div>
  );
}
