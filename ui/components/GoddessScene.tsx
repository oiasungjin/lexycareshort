"use client";

// 완성본에서 "눈 픽셀만" 떼어낸 레이어를 그 자리에서 깜빡이게 한다.
// base: 눈 자리를 피부색으로 칠한 본체. eyes: 눈만(투명배경). 눈이 감기면 base 피부가 보임.
// orb=true: 스플래시와 동일한 투명 구슬이 여신 주위를 부드럽게 떠다님(랜덤).
import { useEffect, useState } from "react";
import styles from "./GoddessScene.module.css";

export function GoddessScene({
  size = 176,
  mood = "idle",
  orb = false,
}: {
  size?: number;
  mood?: "idle" | "happy" | "sad";
  orb?: boolean;
}) {
  const moodClass =
    mood === "happy" ? styles.happy : mood === "sad" ? styles.sad : "";

  // 투명 구슬 랜덤 부유 — 마운트 후에만(SSR 하이드레이션 불일치 방지)
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (!orb) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    let alive = true;
    let timer: number;
    const R = size * 0.24; // 씬 크기에 비례한 부유 범위
    const move = () => {
      if (!alive) return;
      setPos({
        x: (Math.random() * 2 - 1) * R,
        y: (Math.random() * 2 - 1) * R * 0.7,
      });
      timer = window.setTimeout(move, 380 + Math.random() * 420);
    };
    move();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [orb, size]);

  return (
    <div
      className={`${styles.scene} ${moodClass}`}
      style={{ width: size, height: size }}
    >
      {/* 머리 윗부분을 축으로 살짝 흔들려 긴 머리카락이 바람에 나부끼는 느낌 */}
      <div className={styles.figure}>
        {/* eslint-disable @next/next/no-img-element */}
        <img src="/eyesblink/base.png" alt="" className={styles.body} />
        <img src="/eyesblink/eyes.png" alt="" className={styles.eyes} />
        {/* eslint-enable @next/next/no-img-element */}
      </div>
      {orb && (
        <div
          className={styles.orbWrap}
          aria-hidden
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        >
          <div className={styles.orb} />
        </div>
      )}
    </div>
  );
}
