"use client";

// 내 단어 직접 추가 — 단어 + 에피소드 저장. 저장하면 폼이 비워져 다음 단어를 연속 저장할 수 있다.
// 상단 탭 메뉴(기록/훈련/대시보드/나의 인지근육)는 AppShell이 감싸서 제공.
import { useState } from "react";
import type { RecordStore } from "@/logic/record-store";
import { DuoButton } from "./DuoButton";
import { GoddessScene } from "./GoddessScene";
import { SpeechBubble } from "./SpeechBubble";
import styles from "./CustomAdd.module.css";

export function CustomAdd({ store }: { store: RecordStore }) {
  const [word, setWord] = useState("");
  const [episode, setEpisode] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  function save() {
    if (!word.trim() || !episode.trim()) return;
    const w = word.trim();
    store.save({
      cardId: "custom:" + Date.now(),
      input: w,
      description: episode.trim(),
      grade: "got",
      hintsUsed: 0,
      ts: Date.now(),
    });
    setWord("");
    setEpisode("");
    setSaved(w);
    window.clearTimeout((save as unknown as { _t?: number })._t);
    (save as unknown as { _t?: number })._t = window.setTimeout(
      () => setSaved(null),
      2000,
    );
  }

  return (
    <div className={styles.screen}>
      <main className={styles.main}>
        <p className={styles.heading}>내 단어 추가</p>

        <div className={styles.charRow}>
          <div className={styles.char}>
            <GoddessScene size={80} orb />
          </div>
          <SpeechBubble>
            기억이 날 듯 말 듯한 단어를 기록하고,
            <br />그 단어에 얽힌 경험을 적어 주세요.
          </SpeechBubble>
        </div>

        <input
          className={styles.input}
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="단어·이름을 입력하세요"
          aria-label="단어 입력"
          autoFocus
        />
        <textarea
          className={styles.textarea}
          value={episode}
          onChange={(e) => setEpisode(e.target.value)}
          placeholder="이 단어와 관련된 에피소드(경험)을 자유롭게 기록해 보세요."
          aria-label="에피소드 입력"
          rows={3}
        />

        {saved && (
          <p className={styles.saved}>
            ✓ ‘{saved}’ 저장했어요. 다음 단어를 입력하세요.
          </p>
        )}
      </main>

      <footer className={styles.bottom}>
        <DuoButton
          variant="primary"
          onClick={save}
          disabled={!word.trim() || !episode.trim()}
          fullWidth
        >
          저장하기
        </DuoButton>
      </footer>
    </div>
  );
}
