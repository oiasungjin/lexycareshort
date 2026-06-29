"use client";

// 앱 흐름: 스플래시 → 범주 랜딩(탭 없음) → 진입(주제 선택 또는 내 단어 추가) 시 탭 메뉴.
// 탭: 기록(범주/카드/내 단어 추가) · 훈련 · 대시보드 · 나의 인지근육.
import { useMemo, useState } from "react";
import { Splash } from "./Splash";
import { TabBar, type Tab } from "./TabBar";
import { HubMap } from "./HubMap";
import { CardTrainer } from "./CardTrainer";
import { Training } from "./Training";
import { Dashboard } from "./Dashboard";
import { CustomAdd } from "./CustomAdd";
import { GoddessScene } from "./GoddessScene";
import { getCardsByPack } from "@/logic/session";
import { createLocalStorageStore } from "@/logic/record-store.localstorage";
import type { Topic } from "@/content/curriculum";
import styles from "./AppShell.module.css";

export function AppShell() {
  const store = useMemo(() => createLocalStorageStore(), []);
  const [started, setStarted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [tab, setTab] = useState<Tab>("record");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [adding, setAdding] = useState(false);

  const learnedCount = useMemo(
    () => store.all().filter((r) => r.grade === "got").length,
    [store, tab, adding, entered],
  );

  if (!started) {
    return <Splash onDone={() => setStarted(true)} />;
  }

  // 랜딩: 범주 둘러보기 (탭 메뉴 없음)
  if (!entered) {
    return (
      <HubMap
        learnedCount={learnedCount}
        onSelect={(t) => {
          setTopic(t);
          setEntered(true);
        }}
        onAddCustom={() => {
          setAdding(true);
          setEntered(true);
        }}
      />
    );
  }

  function back() {
    setEntered(false);
    setTopic(null);
    setAdding(false);
    setTab("record");
  }
  function changeTab(t: Tab) {
    setTab(t);
    // 탭을 옮겨도 현재 기록 컨텍스트(범주 카드/내 단어)는 유지.
    // 기록 탭인데 아무 컨텍스트도 없으면 내 단어 추가로.
    if (t === "record" && !topic?.packId && !adding) setAdding(true);
  }

  return (
    <div className={styles.app}>
      <TabBar active={tab} onChange={changeTab} onBack={back} />
      <div className={styles.content}>
        {tab === "record" &&
          (topic?.packId && !adding ? (
            <CardTrainer
              cards={getCardsByPack(topic.packId)}
              store={store}
              title={topic.label}
              onExit={() => setTopic(null)}
              hideClose
            />
          ) : (
            <CustomAdd store={store} />
          ))}
        {tab === "train" && <Training store={store} />}
        {tab === "dashboard" && <Dashboard store={store} />}
        {tab === "muscle" && (
          <div className={styles.soon}>
            <div className={styles.soonChar}>
              <GoddessScene size={140} />
            </div>
            <h2 className={styles.soonTitle}>나의 인지근육</h2>
            <p className={styles.soonSub}>준비 중이에요 ✨</p>
          </div>
        )}
      </div>
    </div>
  );
}
