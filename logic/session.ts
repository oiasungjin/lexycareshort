// logic 레이어 — 카드팩 로딩·세션. MVP는 데모 카드 1장.
// 추후 반복 스케줄(SRS)·다중 카드로 확장. content·domain만 의존.

import type { Card, CardPack } from "@/content/schema";
import moviesKo from "@/content/packs/movies.ko.json";

const packs: CardPack[] = [moviesKo as CardPack];

export function allPacks(): CardPack[] {
  return packs;
}

/** MVP 데모: 첫 팩의 모든 카드. 세션에서 순서대로 순환. */
export function getDemoCards(): Card[] {
  return packs[0].cards;
}

/** 팩 id로 카드 조회(학습 경로 노드 → 훈련 연결). 없으면 빈 배열. */
export function getCardsByPack(packId: string): Card[] {
  return packs.find((p) => p.id === packId)?.cards ?? [];
}

/** 카드 id로 카드 조회(기록→훈련 매핑용). 없으면 undefined. */
export function getCardById(cardId: string): Card | undefined {
  for (const p of packs) {
    const c = p.cards.find((card) => card.id === cardId);
    if (c) return c;
  }
  return undefined;
}
