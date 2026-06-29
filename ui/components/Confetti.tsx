"use client";

// 정답 축하용 컨페티. 화면 상단에서 색종이가 흩날린다.
import { useMemo } from "react";
import styles from "./Confetti.module.css";

const COLORS = [
  "var(--color-feather-green)",
  "var(--color-sky-blue)",
  "var(--color-bee-orange)",
  "var(--color-cardinal-red)",
  "var(--color-xp-gold)",
  "var(--color-combo-purple)",
];

export function Confetti({ count = 40 }: { count?: number }) {
  // 한 번만 랜덤 배치(브라우저 클라이언트라 Math.random 사용 가능)
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        bg: COLORS[i % COLORS.length],
        delay: Math.random() * 0.25,
        dur: 1.1 + Math.random() * 0.9,
        size: 7 + Math.random() * 8,
        drift: (Math.random() - 0.5) * 160,
        spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
        round: Math.random() > 0.5,
      })),
    [count],
  );

  return (
    <div className={styles.layer} aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className={styles.piece}
          style={
            {
              left: `${p.left}%`,
              background: p.bg,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: p.round ? "50%" : "2px",
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
