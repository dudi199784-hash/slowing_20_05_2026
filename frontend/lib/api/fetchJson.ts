const DEFAULT_API_BASE_URL = "http://localhost:8090";

function normalizeBaseUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getApiBaseUrl() {
  const envBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL;
  return normalizeBaseUrl(envBaseUrl || DEFAULT_API_BASE_URL);
}

/** 서버/클라이언트 공용 JSON GET (플레이스홀더 API 등 axios와 별도) */
export async function fetchApiJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
