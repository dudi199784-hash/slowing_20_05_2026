const OPENAI_BILLING_HINT =
  "OpenAI 계정의 결제 한도에 도달했습니다. platform.openai.com → Settings → Billing에서 결제 수단·한도·크레딧을 확인한 뒤 다시 시도해 주세요.";

function isOpenAiBillingLimitMessage(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("billing_hard_limit") ||
    t.includes("billing hard limit") ||
    t.includes("billing_limit") ||
    t.includes("insufficient_quota") ||
    t.includes("exceeded your current quota")
  );
}

/** Axios / Spring ProblemDetail 응답을 화면용 문자열로 변환 */
export function formatApiError(err: unknown, fallback = "요청 실패"): string {
  if (!err || typeof err !== "object" || !("response" in err)) {
    const msg = err instanceof Error ? err.message : fallback;
    return isOpenAiBillingLimitMessage(msg) ? OPENAI_BILLING_HINT : msg;
  }
  const data = (err as { response?: { data?: unknown; status?: number } })
    .response?.data;
  const status = (err as { response?: { status?: number } }).response?.status;

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const detail = obj.detail ?? obj.message;
    if (typeof detail === "string" && detail.trim()) {
      if (isOpenAiBillingLimitMessage(detail)) {
        return OPENAI_BILLING_HINT;
      }
      return status ? `[${status}] ${detail}` : detail;
    }
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      /* fall through */
    }
  }
  if (typeof data === "string" && data.trim()) {
    if (isOpenAiBillingLimitMessage(data)) {
      return OPENAI_BILLING_HINT;
    }
    return status ? `[${status}] ${data}` : data;
  }
  return fallback;
}
