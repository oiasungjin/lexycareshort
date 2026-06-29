// logic 레이어 — RecordStore 의 localStorage 구현.
// 브라우저 저장 세부는 오직 이 파일에만. SSR 안전(window 가드).

import type { RecallRecord } from "@/domain";
import type { RecordStore } from "@/logic/record-store";

const DEFAULT_KEY = "lexicare.records";

export function createLocalStorageStore(key: string = DEFAULT_KEY): RecordStore {
  function read(): RecallRecord[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as RecallRecord[]) : [];
    } catch {
      return [];
    }
  }

  function write(records: RecallRecord[]): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(records));
    } catch {
      // 저장 실패는 조용히 무시(MVP). 추후 구조화 로깅으로 대체.
    }
  }

  return {
    save(record) {
      const records = read();
      records.push(record);
      write(records);
    },
    all() {
      return read();
    },
    forCard(cardId) {
      return read().filter((r) => r.cardId === cardId);
    },
    remove(predicate) {
      write(read().filter((r) => !predicate(r)));
    },
  };
}
