// logic 레이어 — 기록을 외부 수집소로 전송하는 싱크(관리자 통계용).
// 구현 세부(Supabase REST)를 인터페이스 뒤로 숨겨 교체 가능하게 한다.
// 순수 fetch만 사용(window·DOM 비의존). 전송 실패는 앱 흐름을 막지 않는다(fire-and-forget).

import type { RecallRecord } from "@/domain";

export interface RemoteEventSink {
  /** 기록 한 건을 원격으로 전송. 실패해도 throw 하지 않는다. */
  send(record: RecallRecord): void;
}

export interface SupabaseSinkConfig {
  url: string;
  anonKey: string;
  /** 익명 클라이언트 식별자(브라우저별). UI 레이어에서 주입. */
  clientId: string;
}

/** 아무것도 하지 않는 싱크(서버 수집 비활성/SSR 대비 기본값). */
export const noopSink: RemoteEventSink = { send() {} };

/** Supabase REST 로 simple_recall_events 에 익명 삽입하는 싱크. */
export function createSupabaseSink(cfg: SupabaseSinkConfig): RemoteEventSink {
  const endpoint = `${cfg.url}/rest/v1/simple_recall_events`;
  return {
    send(record) {
      // 통계에 필요한 비식별 항목만 전송. 자유텍스트(input·description)와
      // 첨부 사진(imageData)은 어느 집계에도 쓰이지 않고 개인정보가 될 수 있어 제외한다.
      const payload = {
        client_id: cfg.clientId,
        card_id: record.cardId,
        grade: record.grade,
        hints_used: record.hintsUsed,
        occurred_at: new Date(record.ts).toISOString(),
      };
      try {
        void fetch(endpoint, {
          method: "POST",
          headers: {
            apikey: cfg.anonKey,
            Authorization: `Bearer ${cfg.anonKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {
          // 네트워크 실패는 조용히 무시. 로컬 저장은 이미 완료된 뒤이므로 사용자 영향 없음.
        });
      } catch {
        // fetch 자체가 없는 환경(SSR 등) — 무시.
      }
    },
  };
}
