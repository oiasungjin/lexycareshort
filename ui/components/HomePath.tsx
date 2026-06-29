"use client";

// 학습 경로(홈) — 굽이치는 노드 길. 여신 인사 + 섹션 배너 + 주제 노드.
// 카드팩이 연결된 노드(영화)는 훈련 시작, 나머지는 "준비 중".
import { useEffect, useMemo, useRef, useState } from "react";
import { CURRICULUM } from "@/content/curriculum";
import type { Section, Topic } from "@/content/curriculum";
import { GoddessScene } from "./GoddessScene";
import { SpeechBubble } from "./SpeechBubble";
import styles from "./HomePath.module.css";

// 노드 좌우 흔들림(지그재그) 패턴 — 한 줄짜리 굽이치는 길
const WAVE = [0, 38, 56, 38, 0, -38, -56, -38];

interface Props {
  onSelect: (topic: Topic) => void;
  learnedCount?: number;
  streak?: number;
  hearts?: number;
}

export function HomePath({
  onSelect,
  learnedCount = 0,
  streak = 1,
  hearts = 5,
}: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  // 전체에서 훈련 가능한 첫 노드 = 현재("시작") 노드
  const firstPlayableId = useMemo(() => {
    for (const s of CURRICULUM)
      for (const t of s.topics) if (t.packId) return t.id;
    return null;
  }, []);

  // 진입 시 열린 "시작" 노드로 부드럽게 스크롤(화면 중앙)
  useEffect(() => {
    const t = window.setTimeout(() => {
      const el = currentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const y =
        rect.top + window.scrollY - window.innerHeight / 2 + rect.height / 2;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }, 600);
    return () => window.clearTimeout(t);
  }, []);

  function tap(topic: Topic) {
    if (topic.packId) {
      onSelect(topic);
    } else {
      setToast(`'${topic.label}'는 곧 추가될 거예요!`);
      window.clearTimeout((tap as any)._t);
      (tap as any)._t = window.setTimeout(() => setToast(null), 1600);
    }
  }

  let nodeIndex = 0;

  return (
    <div className={styles.screen}>
      {/* 상단 스탯 바 */}
      <header className={styles.statbar}>
        <span className={styles.stat}>
          🔥 <b>{streak}</b>
        </span>
        <span className={styles.stat}>
          ⭐ <b>{learnedCount}</b>
        </span>
        <span className={`${styles.stat} ${styles.heart}`}>
          ❤️ <b>{hearts}</b>
        </span>
      </header>

      <div className={styles.scroll}>
        {/* 여신 인사 */}
        <div className={styles.greet}>
          <div className={styles.greetChar}>
            <GoddessScene size={120} />
          </div>
          <SpeechBubble>오늘도 단어를 떠올려 볼까요?</SpeechBubble>
        </div>

        {/* 경로 */}
        {CURRICULUM.map((section: Section) => (
          <section key={section.id} className={styles.section}>
            <div
              className={styles.banner}
              style={{ background: section.color }}
            >
              {section.title}
            </div>

            <div className={styles.path}>
              {section.topics.map((topic) => {
                const offset = WAVE[nodeIndex % WAVE.length];
                nodeIndex += 1;
                const playable = !!topic.packId;
                const isCurrent = topic.id === firstPlayableId;
                return (
                  <div
                    key={topic.id}
                    ref={isCurrent ? currentRef : undefined}
                    className={styles.nodeWrap}
                    style={{ transform: `translateX(${offset}px)` }}
                  >
                    {isCurrent && <span className={styles.startTip}>시작</span>}
                    <button
                      type="button"
                      className={[
                        styles.node,
                        playable ? styles.nodeOpen : styles.nodeLocked,
                        isCurrent ? styles.nodeCurrent : "",
                      ].join(" ")}
                      style={
                        playable
                          ? ({
                              "--node": section.color,
                            } as React.CSSProperties)
                          : undefined
                      }
                      onClick={() => tap(topic)}
                      aria-label={`${topic.label}${playable ? "" : " (준비 중)"}`}
                    >
                      <span className={styles.nodeEmoji}>
                        {playable ? topic.emoji : "🔒"}
                      </span>
                    </button>
                    <span className={styles.nodeLabel}>{topic.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <div className={styles.tail}>곧 더 많은 주제가 열려요 ✨</div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
