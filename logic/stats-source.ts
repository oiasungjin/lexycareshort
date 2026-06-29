// logic 레이어 — 관리자 통계 '읽기' 경로 추상화.
// 읽기는 서버 API(/api/admin-stats)를 통해서만 이뤄진다. Supabase 직접 호출/키는 ui·logic 어디에도 없음.
// 패스코드 검증·service_role 호출은 전부 서버에서 처리(클라이언트 비노출).

/** simple_recall_stats() 가 반환하는 집계(개인 식별 정보 없음). */
export interface RecallStats {
  total_events: number;
  unique_clients: number;
  got: number;
  partial: number;
  forgot: number;
  accuracy: number;
  events_last_7d: number;
  last_event_at: string | null;
}

/** 패스코드 불일치(401). 잘못된 자격증명과 그 외 오류를 구분하기 위함. */
export class UnauthorizedError extends Error {
  constructor() {
    super("unauthorized");
    this.name = "UnauthorizedError";
  }
}

export interface StatsSource {
  /** 패스코드를 서버에 보내 검증받고 집계를 가져온다. 불일치 시 UnauthorizedError. */
  load(passcode: string): Promise<RecallStats>;
}

/** 내부 서버 API(/api/admin-stats)를 호출하는 구현. */
export function createApiStatsSource(endpoint = "/api/admin-stats"): StatsSource {
  return {
    async load(passcode) {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (res.status === 401) throw new UnauthorizedError();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as RecallStats;
    },
  };
}
