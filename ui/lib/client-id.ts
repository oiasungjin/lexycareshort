// ui 레이어 — 익명 클라이언트 식별자(브라우저별 1개, localStorage 유지).
// 개인정보가 아니라 무작위 값이며, 서버 수집 데이터에서 '몇 명/몇 기기'를 세는 용도.
const KEY = "lexicare.clientId";

export function getClientId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `c-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}
