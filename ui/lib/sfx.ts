// ui 레이어 — 정답/오답 효과음(Web Audio로 합성, 외부 음원 없음).
// 버튼/Enter 등 사용자 제스처로 호출되므로 재생 허용됨.

function makeCtx(): any {
  const C: any =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  return C ? new C() : null;
}

function blip(
  ac: any,
  freq: number,
  start: number,
  dur: number,
  peak: number,
  type: OscillatorType,
  slideTo?: number,
) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(peak, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0006, start + dur);
  o.connect(g).connect(ac.destination);
  o.start(start);
  o.stop(start + dur + 0.05);
}

/** 정답 — 밝고 경쾌한 상승 아르페지오 + 반짝임. */
export function playCorrect() {
  try {
    const ac = makeCtx();
    if (!ac) return;
    const t = ac.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      blip(ac, f, t + i * 0.08, 0.18, 0.18, "triangle"),
    );
    blip(ac, 1318.51, t + 0.3, 0.5, 0.12, "sine"); // 끝 반짝임
  } catch {
    // 오디오 미지원/차단 시 무시.
  }
}

/** 오답 — 아쉬운 하강음(살짝 처지는 두 음). */
export function playWrong() {
  try {
    const ac = makeCtx();
    if (!ac) return;
    const t = ac.currentTime;
    blip(ac, 392.0, t, 0.24, 0.16, "sawtooth", 370.0); // G4 ↘
    blip(ac, 329.63, t + 0.2, 0.5, 0.16, "sawtooth", 246.94); // E4 ↘ C4
  } catch {
    // 무시.
  }
}
