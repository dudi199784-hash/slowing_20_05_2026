import axios from "axios";
import { clearSession, getAccessToken } from "@/lib/auth/session";

const DEFAULT_API_BASE_URL = "http://localhost:8090";

/** 로그인·API 호출이 같은 호스트를 쓰도록 환경 변수와 맞출 것 (다르면 JWT는 유효해도 다른 백엔드로 가서 403/401) */
const resolvedBaseUrl =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "")) ||
  DEFAULT_API_BASE_URL;

export const http = axios.create({
  baseURL: resolvedBaseUrl,
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  /**
   * Axios 1.x transformRequest: Content-Type 이 application/json 이면 FormData 를
   * JSON 으로 바꿔 버림 → multipart 바이너리(템플릿·마스크) 손상. ver2 는 인터셉터 없어 이 문제가
   * 드러나지 않았을 수 있음.
   */
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    const ax = err as {
      response?: { status?: number };
      config?: { url?: string };
    };
    const status = ax.response?.status;
    const url = ax.config?.url ?? "";
    const isOpenAiImages =
      url.includes("/api/v1/openai/images") ||
      url.endsWith("/edit-uniform") ||
      url.endsWith("/uniform-proposal") ||
      url.endsWith("/product-proposal") ||
      url.endsWith("/generate");
    const isLogoAssetAuth =
      url.includes("/api/v1/logo-assets/mine") ||
      url.includes("/visibility") ||
      url.endsWith("/like");
    if (typeof window !== "undefined") {
      const isLoginRequest = url.includes("/api/v1/members/login");
      /** 세션 무효(다른 기기 로그인) 등 — 403 도 로그아웃 처리 */
      const hadToken = Boolean(getAccessToken());
      if (
        !isLoginRequest &&
        (status === 401 ||
          (status === 403 && (isOpenAiImages || isLogoAssetAuth || hadToken)))
      ) {
        clearSession();
      }
    }
    return Promise.reject(err);
  },
);