// logic 레이어 — 정답 채점. 순수 함수. content·domain만 의존.

import type { Answer } from "@/content/schema";

export type MatchResult = "correct" | "partial" | "wrong";

/** 공백·대소문자·문장부호 무시. */
function normalize(s: string): string {
  return s.replace(/\s+/g, "").replace(/[.,!?·]/g, "").toLowerCase();
}

/**
 * 입력과 정답 비교.
 * - correct: 정답/허용 표기와 완전 일치.
 * - partial: 한쪽이 다른 쪽을 포함(부분 인출).
 * - wrong: 그 외.
 */
export function compareAnswer(input: string, answer: Answer): MatchResult {
  const n = normalize(input);
  if (!n) return "wrong";
  const targets = [answer.primary, ...(answer.accept ?? [])].map(normalize);
  if (targets.includes(n)) return "correct";
  if (targets.some((t) => t.includes(n) || n.includes(t))) return "partial";
  return "wrong";
}
