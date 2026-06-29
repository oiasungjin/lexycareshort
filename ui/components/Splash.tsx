"use client";

// 스플래시(로딩) — 투명 구슬이 굴러다니고, 여신이 구슬에 합쳐지며 신비한 소리 + 환한 빛 → 앱 시작.
// 소리는 브라우저 자동재생 정책상 사용자 탭(제스처) 후 재생. 무입력 시 자동 진행(소리 없이).

import { useEffect, useRef, useState } from "react";
import { GoddessScene } from "./GoddessScene";
import styles from "./Splash.module.css";

type Stage = "rolling" | "merging";

const MERGE_MS = 1700; // 합쳐짐 + 플래시 길이(구슬이 천천히 들어감)

// Web Audio로 신비로운 사운드 합성(외부 음원 없음).
// 따뜻한 패드 + 종소리 같은 펜타토닉 아르페지오 + 잔향(에코) + 고음 반짝임.
function playChime() {
  try {
    const Ctx: any =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.value = 0.7;
    const filter = ctx.createBiquadFilter(); // 따뜻하게(고역 완화)
    filter.type = "lowpass";
    filter.frequency.value = 3400;
    filter.connect(master);
    master.connect(ctx.destination);

    // 부드러운 단음(벨/패드). type·detune으로 음색을 흔든다.
    function tone(
      freq: number,
      start: number,
      dur: number,
      peak: number,
      type: OscillatorType,
      detune = 0,
    ) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      o.detune.value = detune;
      const t = now + start;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
      o.connect(g).connect(filter);
      o.start(t);
      o.stop(t + dur + 0.1);
    }

    // 1) 패드 스웰(신비로운 바닥) — 살짝 디튠한 두 사인
    tone(196.0, 0, 2.8, 0.05, "sine", -7); // G3
    tone(293.66, 0, 2.8, 0.045, "sine", 7); // D4

    // 2) 반짝이는 펜타토닉 아르페지오(삼각파 벨) + 에코 한 겹
    const arp = [523.25, 587.33, 783.99, 880.0, 1174.66]; // C5 D5 G5 A5 D6
    arp.forEach((f, i) => {
      tone(f, 0.25 + i * 0.16, 1.7, 0.13, "triangle", i % 2 ? 5 : -5);
      tone(f, 0.25 + i * 0.16 + 0.3, 1.3, 0.06, "triangle", 0); // 잔향
    });

    // 3) 끝에 고음 반짝임
    tone(1567.98, 1.3, 1.5, 0.08, "sine"); // G6
    tone(2349.32, 1.5, 1.3, 0.05, "sine"); // D7
  } catch {
    // 오디오 미지원/차단 시 무시.
  }
}

export function Splash({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState<Stage>("rolling");
  const doneRef = useRef(false);

  // 투명 구슬 랜덤 이동 — 일정치 않은 간격마다 무작위 위치로 부드럽게 떠돌게
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (stage !== "rolling") return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    let alive = true;
    let timer: number;
    const move = () => {
      if (!alive) return;
      setPos({
        x: (Math.random() * 2 - 1) * 85,
        y: (Math.random() * 2 - 1) * 45,
      });
      timer = window.setTimeout(move, 380 + Math.random() * 420);
    };
    move();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [stage]);

  function begin(withSound: boolean) {
    if (doneRef.current) return;
    doneRef.current = true;
    setPos({ x: 0, y: 0 }); // 합쳐질 때 여신 구슬 위치로 정확히 빨려들도록 중앙 복귀
    setStage("merging");
    if (withSound) playChime();
    window.setTimeout(onDone, MERGE_MS);
  }

  return (
    <div
      className={styles.splash}
      data-stage={stage}
      role="button"
      tabIndex={0}
      aria-label="시작하기"
      onClick={() => begin(true)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && begin(true)}
    >
      <div className={styles.scene}>
        <div className={styles.goddess} aria-hidden>
          <GoddessScene />
        </div>
        <div
          className={styles.marbleWrap}
          aria-hidden
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        >
          <div className={styles.marble} />
        </div>
      </div>

      {/* 항상 렌더(레이아웃 고정) — 합쳐질 때 페이드아웃만. 제거하면 중앙정렬이 바뀌어 여신이 움직임. */}
      <p className={styles.brand}>므네모</p>
      <p className={styles.hint}>생각날 듯 말 듯한 그 단어, 이제 꽉 붙잡으세요.</p>

      <div className={styles.flashLayer} aria-hidden />
    </div>
  );
}
