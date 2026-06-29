// 진행/힌트 단계 표시 바. Sky Blue.
import styles from "./ProgressBar.module.css";

interface Props {
  /** 0~1 */
  value: number;
}

export function ProgressBar({ value }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={styles.track} role="progressbar" aria-valuenow={Math.round(pct)}>
      <div className={styles.fill} style={{ width: `${pct}%` }} />
    </div>
  );
}
