"use client";

// 상단 탭 네비게이션(범주→하위범주 진입 후 표시): 기록 · 훈련 · 대시보드 · 나의 인지근육(준비중)
// 맨 앞 ← 로 범주 선택으로 돌아간다. 아이콘 없이 글자만.
import styles from "./TabBar.module.css";

export type Tab = "record" | "train" | "dashboard" | "muscle";

const TABS: { id: Tab; label: string; soon?: boolean }[] = [
  { id: "record", label: "기록" },
  { id: "train", label: "훈련" },
  { id: "dashboard", label: "대시보드" },
  { id: "muscle", label: "나의 인지근육", soon: true },
];

export function TabBar({
  active,
  onChange,
  onBack,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  onBack?: () => void;
}) {
  return (
    <nav className={styles.bar}>
      {onBack && (
        <button
          type="button"
          className={styles.back}
          onClick={onBack}
          aria-label="범주로 돌아가기"
        >
          ‹
        </button>
      )}
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`${styles.tab} ${active === t.id ? styles.active : ""}`}
          onClick={() => onChange(t.id)}
          aria-current={active === t.id}
        >
          <span className={styles.label}>{t.label}</span>
          {t.soon && <span className={styles.soon}>준비중</span>}
        </button>
      ))}
    </nav>
  );
}
