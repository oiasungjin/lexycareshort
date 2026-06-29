// logic 레이어 — 기록 저장소 추상 인터페이스.
// 구현(localStorage/서버)을 이 인터페이스 뒤로 숨겨 교체를 쉽게 한다.

import type { RecallRecord } from "@/domain";

export interface RecordStore {
  save(record: RecallRecord): void;
  all(): RecallRecord[];
  forCard(cardId: string): RecallRecord[];
  /** 조건에 맞는 기록 삭제(true 인 것만 제거). */
  remove(predicate: (record: RecallRecord) => boolean): void;
}
