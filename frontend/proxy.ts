import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** `lib/auth/constants.ts` 의 `AUTH_PRESENCE_COOKIE_NAME` 과 동일하게 유지 */
const AUTH_PRESENCE_COOKIE_NAME = "cc_auth";

function isProtectedPath(pathname: string): boolean {
  if (
    pathname === "/user/mypage" ||
    pathname === "/user/designs" ||
    pathname === "/user/orders" ||
    pathname === "/user/account"
  )
    return true;
  if (pathname === "/cart" || pathname.startsWith("/cart/")) return true;
  return false;
}

/** Next.js 16+: 예전 `middleware` 대신 `proxy` (요청 전에 실행) */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();

  const hasPresence = request.cookies.get(AUTH_PRESENCE_COOKIE_NAME)?.value === "1";
  if (hasPresence) return NextResponse.next();

  return NextResponse.redirect(new URL("/login", request.url));
}

/**
 * 좁은 matcher 는 App Router 의 RSC/프리패치 요청에서 빗나가는 경우가 있어,
 * 정적·이미지 최적화만 제외하고 proxy 를 탄 뒤 pathname 으로 보호 여부를 판별한다.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|svg|jpg|jpeg|gif|webp|avif|woff2?)$).*)",
  ],
};
