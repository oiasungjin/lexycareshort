// domain 레이어 — 훈련 도메인 타입·규칙. 순수 TS(프레임워크 비의존).
// 의존 허용: content(타입 참조).

import type { Card } from "@/content/schema";

export type { Card } from "@/content/schema";
export type { Hint, Answer, CardPack, Locale } from "@/content/schema";

/** 자가 평가 등급. */
export type RecallGrade = "got" | "partial" | "forgot";

/** 한 번의 단어 인출 시도 기록. */
export interface RecallRecord {
  cardId: string;
  /** 사용자가 입력한 단어. */
  input: string;
  /** 사용자가 단어를 설명한 텍스트(선택). */
  description?: string;
  /** 정답 판정 결과. */
  grade: RecallGrade;
  /** 정답까지 사용한 힌트 단계 수(0=힌트 없이). */
  hintsUsed: number;
  /** epoch millis. */
  ts: number;
  /** 사용자가 직접 추가한 단어의 첨부 사진(data URL, 선택). */
  imageData?: string;
}

/** 카드 + 누적 기록(추후 반복 스케줄용). */
export interface TrainingItem {
  card: Card;
  records: RecallRecord[];
}
