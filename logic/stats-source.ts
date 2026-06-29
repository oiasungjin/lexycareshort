// logic 레이어 — 관리자 통계 '읽기' 경로 추상화.
// 쓰기(remote-sink)와 대칭으로, Supabase 의존을 인터페이스 뒤에 숨겨 교체를 쉽게 한다.
// ui(admin 페이지)는 이 인터페이스만 알고 REST 세부는 모른다.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/logic/supabase-config";

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

export interface StatsSource {
  load(): Promise<RecallStats>;
}

export interface SupabaseStatsConfig {
  url: string;
  anonKey: string;
}

/** Supabase RPC(simple_recall_stats)로 집계를 읽는 구현. */
export function createSupabaseStatsSource(
  cfg: SupabaseStatsConfig = { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY },
): StatsSource {
  return {
    async load() {
      const res = await fetch(`${cfg.url}/rest/v1/rpc/simple_recall_stats`, {
        method: "POST",
        headers: {
          apikey: cfg.anonKey,
          Authorization: `Bearer ${cfg.anonKey}`,
          "Content-Type": "application/json",
        },
        body: "{}",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as RecallStats;
    },
  };
}
