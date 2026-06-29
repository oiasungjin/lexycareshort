"use client";

// 대시보드 — 통계 요약 + 최근 기록(내 단어·분야별 단어 누적, 정렬·반복필터·삭제).
import { useMemo, useState } from "react";
import type { RecordStore } from "@/logic/record-store";
import styles from "./Dashboard.module.css";

function fmtDate(ts: number): string {
  const d = new Date(ts);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

export function Dashboard({ store }: { store: RecordStore }) {
  const [sort, setSort] = useState<"new" | "old">("new");
  const [repeatedOnly, setRepeatedOnly] = useState(false);
  const [ver, setVer] = useState(0); // 삭제 후 재계산

  const records = useMemo(() => {
    const byWord = new Map<
      string,
      { word: string; count: number; ts: number }
    >();
    for (const r of store.all()) {
      const word = r.input.trim();
      if (!word) continue;
      const prev = byWord.get(word);
      if (!prev) {
        byWord.set(word, { word, count: 1, ts: r.ts });
      } else {
        prev.count += 1;
        if (r.ts >= prev.ts) prev.ts = r.ts;
      }
    }
    let list = [...byWord.values()];
    if (repeatedOnly) list = list.filter((i) => i.count >= 2);
    list.sort((a, b) => (sort === "new" ? b.ts - a.ts : a.ts - b.ts));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, sort, repeatedOnly, ver]);

  function del(word: string) {
    store.remove((r) => r.input.trim() === word);
    setVer((v) => v + 1);
  }

  return (
    <div className={styles.screen}>
      <h2 className={styles.title}>최근 기록</h2>
      <div className={styles.controls}>
        <label className={styles.ctrl}>
          정렬
          <select
            className={styles.select}
            value={sort}
            onChange={(e) => setSort(e.target.value as "new" | "old")}
          >
            <option value="new">최신순</option>
            <option value="old">오래된순</option>
          </select>
        </label>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={repeatedOnly}
            onChange={(e) => setRepeatedOnly(e.target.checked)}
          />
          반복 단어만
        </label>
      </div>

      {records.length === 0 ? (
        <p className={styles.hint}>
          아직 기록이 없어요. 내 단어를 추가하거나 분야에서 기록해 보세요!
        </p>
      ) : (
        <ul className={styles.list}>
          {records.map((r) => (
            <li key={r.word} className={styles.row}>
              <span className={styles.word}>{r.word}</span>
              <div className={styles.meta}>
                {r.count >= 2 && (
                  <span className={styles.repeat}>{r.count}번</span>
                )}
                <span className={styles.date}>{fmtDate(r.ts)}</span>
                <button
                  type="button"
                  className={styles.del}
                  onClick={() => del(r.word)}
                  aria-label={`${r.word} 삭제`}
                >
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
