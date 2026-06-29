// 구슬 트레이 — 10개 모으기. 맞으면 채워지고(팝), 틀리면 한 칸 깨진다(크랙+흔들림).
import styles from "./MarbleTray.module.css";

interface Props {
  /** 현재 모은 구슬 수(0~total). */
  count: number;
  /** 직전 결과: 채움 또는 깨짐. 애니메이션 트리거. */
  mode: "gain" | "break";
  total?: number;
}

export function MarbleTray({ count, mode, total = 10 }: Props) {
  return (
    <div
      className={`${styles.tray} ${mode === "break" ? styles.shake : ""}`}
      aria-label={`구슬 ${count}/${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < count;
        const isLatest = mode === "gain" && i === count - 1;
        const isCracked = mode === "break" && i === count; // 방금 잃은 자리
        return (
          <span
            key={i}
            className={[
              styles.marble,
              filled ? styles.filled : "",
              isLatest ? styles.pop : "",
              isCracked ? styles.cracked : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        );
      })}
    </div>
  );
}
