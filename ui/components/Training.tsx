"use client";

// 훈련 — 기록한 '에피소드'가 문제, 그 에피소드의 '이름'이 정답.
// 출처별 필터: 전체 / 내 단어(직접 추가) / 영화(범주 기록). CardTrainer를 train 모드로 재사용.
import { useMemo, useState } from "react";
import { allPacks, getCardById } from "@/logic/session";
import type { Card } from "@/content/schema";
import type { RecordStore } from "@/logic/record-store";
import { CardTrainer } from "./CardTrainer";
import { GoddessScene } from "./GoddessScene";
import styles from "./Training.module.css";

type Filter = "all" | "custom" | "category";
type Source = "custom" | "category";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "custom", label: "내 단어" },
  { id: "category", label: "분야 단어" },
];

export function Training({ store }: { store: RecordStore }) {
  const [filter, setFilter] = useState<Filter>("all");

  const items = useMemo(() => {
    // 에피소드가 있는 기록 → 문제: 에피소드, 정답: 입력 단어. 입력 단어별 최신 1개.
    const byWord = new Map<
      string,
      { card: Card; episode: string; source: Source }
    >();
    for (const r of store.all()) {
      if (!r.description || !r.description.trim()) continue;
      const word = r.input.trim();
      if (!word) continue;
      const isCustom = r.cardId.startsWith("custom:");
      const base = getCardById(r.cardId);
      byWord.set(word, {
        card: base
          ? { ...base, id: "train:" + word, answer: { primary: word, accept: [word] } }
          : {
              id: "train:" + word,
              category: "내 단어",
              locale: "ko",
              difficulty: 3,
              answer: { primary: word, accept: [word] },
              hints: [],
            },
        episode: r.description.trim(),
        source: isCustom ? "custom" : "category",
      });
    }
    return [...byWord.values()];
  }, [store]);

  // 오답 보기 후보: 내 단어 + 전체 영화 이름
  const pool = useMemo(
    () =>
      Array.from(
        new Set([
          ...items.map((i) => i.card.answer.primary),
          ...allPacks().flatMap((p) => p.cards.map((c) => c.answer.primary)),
        ]),
      ),
    [items],
  );

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyChar}>
          <GoddessScene size={120} />
        </div>
        <p className={styles.emptyTitle}>아직 훈련할 에피소드가 없어요</p>
        <p className={styles.emptySub}>
          내 단어를 추가하거나 분야에서 단어를 기록해 보세요.
        </p>
      </div>
    );
  }

  const filtered =
    filter === "all" ? items : items.filter((i) => i.source === filter);
  const cards = filtered.map((i) => i.card);
  const episodes: Record<string, string> = {};
  filtered.forEach((i) => {
    episodes[i.card.id] = i.episode;
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`${styles.chip} ${filter === f.id ? styles.chipActive : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className={styles.deck}>
        {cards.length === 0 ? (
          <p className={styles.none}>이 분류에 훈련할 단어가 아직 없어요.</p>
        ) : (
          <CardTrainer
            key={filter}
            cards={cards}
            episodes={episodes}
            mode="train"
            store={store}
            choicePool={pool}
            hideClose
          />
        )}
      </div>
    </div>
  );
}
