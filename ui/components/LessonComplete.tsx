// 레슨 완료 화면 — 별 평가 + 총 XP·정확도·최고 콤보 정산 + 축하 연출.
import { DuoButton } from "./DuoButton";
import { GoddessScene } from "./GoddessScene";
import { Confetti } from "./Confetti";
import styles from "./LessonComplete.module.css";

interface Props {
  totalXp: number;
  correctCount: number;
  answered: number;
  bestStreak: number;
  outOfHearts?: boolean;
  onRestart: () => void;
  onHome?: () => void;
}

export function LessonComplete({
  totalXp,
  correctCount,
  answered,
  bestStreak,
  outOfHearts = false,
  onRestart,
  onHome,
}: Props) {
  const accuracy = answered ? Math.round((correctCount / answered) * 100) : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1;

  return (
    <div className={styles.screen}>
      {!outOfHearts && <Confetti count={60} />}

      <div className={styles.inner}>
        {outOfHearts ? (
          <div className={styles.stars} aria-label="하트 소진">
            <span className={styles.brokenHeart}>💔</span>
          </div>
        ) : (
          <div className={styles.stars} aria-label={`별 ${stars}개`}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`${styles.star} ${i < stars ? styles.on : ""}`}
                style={{ animationDelay: `${0.15 + i * 0.18}s` }}
              >
                ★
              </span>
            ))}
          </div>
        )}

        <div className={styles.char}>
          <GoddessScene size={140} mood={outOfHearts ? "sad" : "happy"} />
        </div>

        <h1 className={styles.title}>
          {outOfHearts ? "하트를 다 썼어요" : "레슨 완료!"}
        </h1>
        <p className={styles.sub}>
          {outOfHearts
            ? "괜찮아요, 다시 도전해볼까요?"
            : "오늘도 한 걸음 더 기억해냈어요"}
        </p>

        <div className={styles.stats}>
          <div className={`${styles.stat} ${styles.statGold}`}>
            <span className={styles.statLabel}>총 XP</span>
            <span className={styles.statValue}>+{totalXp}</span>
          </div>
          <div className={`${styles.stat} ${styles.statGreen}`}>
            <span className={styles.statLabel}>정확도</span>
            <span className={styles.statValue}>{accuracy}%</span>
          </div>
          <div className={`${styles.stat} ${styles.statOrange}`}>
            <span className={styles.statLabel}>최고 콤보</span>
            <span className={styles.statValue}>🔥{bestStreak}</span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        {onHome && (
          <DuoButton variant="primary" onClick={onHome} fullWidth>
            경로로 돌아가기
          </DuoButton>
        )}
        <DuoButton
          variant={onHome ? "ghost" : "primary"}
          onClick={onRestart}
          fullWidth
        >
          다시 하기
        </DuoButton>
      </div>
    </div>
  );
}
