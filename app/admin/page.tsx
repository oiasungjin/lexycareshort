"use client";

// 관리자 통계 페이지(/admin) — 서버에 누적된 익명 훈련 데이터의 '집계'를 본다.
// 읽기는 logic 의 StatsSource 인터페이스 뒤로만 호출(Supabase 세부는 logic 에 격리).
//
// 보안 주의: 아래 집계(simple_recall_stats)는 anon 키로 호출 가능 = 사실상 '공개 집계'다.
// 따라서 ADMIN_PASSCODE 는 강한 인증이 아니라 우연한 노출을 줄이는 경량 게이트일 뿐이다.
// 집계가 민감해지면 게이트를 서버측(RLS/별도 인증)으로 옮겨야 한다. (검수 M2)
import { useState } from "react";
import {
  createSupabaseStatsSource,
  type RecallStats,
} from "@/logic/stats-source";
import styles from "./admin.module.css";

const ADMIN_PASSCODE = "lexicare2026";
const statsSource = createSupabaseStatsSource();

export default function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [stats, setStats] = useState<RecallStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setStats(await statsSource.load());
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }

  function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setUnlocked(true);
      void load();
    } else {
      setError("패스코드가 올바르지 않습니다.");
    }
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
          <button type="submit" className={styles.primaryBtn}>
            보기
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
          onClick={() => void load()}
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
