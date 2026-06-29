import { describe, it, expect, beforeEach } from "vitest";
import { createLocalStorageStore } from "@/logic/record-store.localstorage";
import type { RecallRecord } from "@/domain";

// 최소 localStorage 목(jsdom 의존 없이).
class MemoryStorage {
  private map = new Map<string, string>();
  getItem(k: string) {
    return this.map.has(k) ? this.map.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
}

function rec(cardId: string): RecallRecord {
  return { cardId, input: "x", grade: "got", hintsUsed: 0, ts: 1 };
}

beforeEach(() => {
  // @ts-expect-error 테스트용 window 목 주입
  globalThis.window = { localStorage: new MemoryStorage() };
});

describe("localStorage RecordStore", () => {
  it("save → all 라운드트립", () => {
    const store = createLocalStorageStore("test.key");
    expect(store.all()).toEqual([]);
    store.save(rec("a"));
    store.save(rec("b"));
    expect(store.all()).toHaveLength(2);
  });

  it("forCard 는 해당 카드만 필터", () => {
    const store = createLocalStorageStore("test.key");
    store.save(rec("a"));
    store.save(rec("b"));
    store.save(rec("a"));
    expect(store.forCard("a")).toHaveLength(2);
    expect(store.forCard("b")).toHaveLength(1);
  });

  it("window 없으면 빈 배열(SSR 안전)", () => {
    // @ts-expect-error 일시적으로 window 제거
    delete globalThis.window;
    const store = createLocalStorageStore("test.key");
    expect(store.all()).toEqual([]);
    store.save(rec("a")); // 던지지 않음
    expect(store.all()).toEqual([]);
  });
});
