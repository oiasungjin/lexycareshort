"use client";

// 관리자 통계 페이지(/admin) — 서버에 누적된 익명 훈련 데이터의 '집계'를 본다.
// 패스코드는 클라이언트에 없다. 입력값을 서버(/api/admin-stats)로 보내 검증받고,
// 통과해야만 집계를 돌려받는다(통계 함수는 anon 호출 차단됨). 읽기 세부는 StatsSource 뒤로 격리.
import { useState } from "react";
import {
  createApiStatsSource,
  UnauthorizedError,
  type RecallStats,
} from "@/logic/stats-source";
import styles from "./admin.module.css";

const statsSource = createApiStatsSource();

export default function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [stats, setStats] = useState<RecallStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // passcode 를 받는 형태로 분리 — 잠금 해제와 새로고침 모두 같은 경로를 쓴다.
  async function fetchStats(code: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await statsSource.load(code);
      setStats(data);
      setUnlocked(true);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        setError("패스코드가 올바르지 않습니다.");
        setUnlocked(false);
      } else {
        setError(e instanceof Error ? e.message : "불러오기 실패");
      }
    } finally {
      setLoading(false);
    }
  }

  function unlock(e: React.FormEvent) {
    e.preventDefault();
    void fetchStats(passcode);
  }

  if (!unlocked) {
    return (
      <main className={styles.wrap}>
        <h1 className={styles.title}>관리자 통계</h1>
        <form onSubmit={unlock} className={styles.form}>
          <input
            type="password"
            value={passcode}
            onChange={(ev) => setPasscode(ev.target.value)}
            placeholder="패스코드"
            className={styles.input}
          />
          <button type="submit" disabled={loading} className={styles.primaryBtn}>
            {loading ? "확인 중…" : "보기"}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </main>
    );
  }

  const rows: { label: string; value: string }[] = stats
    ? [
        { label: "총 기록 수", value: String(stats.total_events) },
        { label: "참여 기기 수", value: String(stats.unique_clients) },
        { label: "정답률", value: `${stats.accuracy}%` },
        {
          label: "맞음 / 부분 / 잊음",
          value: `${stats.got} / ${stats.partial} / ${stats.forgot}`,
        },
        { label: "최근 7일 기록", value: String(stats.events_last_7d) },
        {
          label: "마지막 기록",
          value: stats.last_event_at
            ? new Date(stats.last_event_at).toLocaleString("ko-KR")
            : "—",
        },
      ]
    : [];

  return (
    <main className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>관리자 통계</h1>
        <button
          type="button"
          onClick={() => void fetchStats(passcode)}
          disabled={loading}
          className={styles.ghostBtn}
        >
          {loading ? "불러오는 중…" : "새로고침"}
        </button>
      </div>

      {error && <p className={styles.error}>오류: {error}</p>}

      {stats && (
        <div className={styles.table}>
          {rows.map((r) => (
            <div key={r.label} className={styles.row}>
              <span className={styles.rowLabel}>{r.label}</span>
              <span className={styles.rowValue}>{r.value}</span>
            </div>
          ))}
        </div>
      )}

      <p className={styles.note}>
        익명 집계만 표시됩니다. 단어·설명·사진 등 원시 입력은 서버에 저장하지
        않으며, 등급·시각·익명 기기 식별자만 수집합니다.
      </p>
    </main>
  );
}
