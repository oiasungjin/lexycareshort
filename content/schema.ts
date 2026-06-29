// content 레이어 — 카드 데이터의 타입 단일 출처.
// 순수 타입만. React·Next·로직 의존 금지(최하위 레이어).

export type Locale = "ko" | "ja";

/** 힌트 표현 방식: poster(글씨 없는 포스터형) | rebus(그림 수수께끼 조각) */
export type HintKind = "poster" | "rebus";

export interface Hint {
  /** 1부터. 작을수록 약한 힌트(먼저 노출). 오름차순. */
  level: number;
  kind: HintKind;
  /** 추후 실제 이미지 생성을 위한 프롬프트(자리표시자). 사용자가 추후 실제 이미지 제공 예정. */
  imagePrompt: string;
  /** 실제 이미지 경로. 없으면 pieces 자리표시자로 렌더. */
  imagePath?: string;
  /** imagePath가 없을 때 보여줄 리버스 조각(이모지/글자). */
  pieces?: string[];
  /** 힌트 아래 안내 문구. */
  caption: string;
}

export interface Answer {
  /** 정답(표시용 정본). */
  primary: string;
  /** 허용 표기·동의어(공백/대소문자는 채점 시 무시). */
  accept?: string[];
}

export interface Card {
  id: string;
  /** 카테고리: 영화·사람이름·사물 등. 최종 목록은 미정. */
  category: string;
  locale: Locale;
  /** 1~5. 인출 난이도. */
  difficulty: number;
  answer: Answer;
  /** level 오름차순. 첫 힌트부터 단계적으로 노출. */
  hints: Hint[];
}

export interface CardPack {
  id: string;
  title: string;
  locale: Locale;
  cards: Card[];
}
