// 힌트 그림 캐러셀 — 좌우 화살표 + 모바일 스와이프(밀기)로 힌트 그림을 넘긴다.
// 상태는 부모(CardTrainer)가 보유. 이 컴포넌트는 표시 + 제스처만 담당.

import { useRef } from "react";
import type { Hint } from "@/content/schema";
import { HintImage } from "./HintImage";
import styles from "./HintCarousel.module.css";

interface Props {
  hints: Hint[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
  category?: string;
}

const SWIPE_THRESHOLD = 40; // px

export function HintCarousel({
  hints,
  index,
  onPrev,
  onNext,
  category,
}: Props) {
  const startX = useRef<number | null>(null);

  function begin(x: number) {
    startX.current = x;
  }

  function end(x: number) {
    if (startX.current === null) return;
    const dx = x - startX.current;
    startX.current = null;
    if (dx <= -SWIPE_THRESHOLD) onNext();
    else if (dx >= SWIPE_THRESHOLD) onPrev();
  }

  const atStart = index <= 0;
  const atEnd = index >= hints.length - 1;

  return (
    <div className={styles.wrap}>
      <div
        className={styles.swipe}
        onTouchStart={(e) => begin(e.touches[0].clientX)}
        onTouchEnd={(e) => end(e.changedTouches[0].clientX)}
        onPointerDown={(e) => begin(e.clientX)}
        onPointerUp={(e) => end(e.clientX)}
      >
        <HintImage
          hint={hints[index]}
          category={category}
          overlay={
            <>
              {!atStart && (
                <button
                  type="button"
                  className={`${styles.arrow} ${styles.left}`}
                  onClick={onPrev}
                  aria-label="이전 힌트"
                >
                  ‹
                </button>
              )}
              {!atEnd && (
                <button
                  type="button"
                  className={`${styles.arrow} ${styles.right} ${styles.hintBtn}`}
                  onClick={onNext}
                  aria-label="다음 힌트"
                >
                  ‹ 힌트
                </button>
              )}
            </>
          }
        />
      </div>

      <div className={styles.dots} aria-label={`힌트 ${index + 1}/${hints.length}`}>
        {hints.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
