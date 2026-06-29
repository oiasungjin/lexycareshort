"use client";

// 학습 메뉴 — 검색 + 아코디언(허브 배너=탭, 호버/탭 시 해당 소메뉴만 펼침).
// 펼친 허브는 여신 중심 + 주변 원형 노드(많으면 2겹 링). 주제 탭 → 훈련(영화) / "준비 중".
import { Fragment, useMemo, useRef, useState } from "react";
import { CURRICULUM } from "@/content/curriculum";
import type { Section, Topic } from "@/content/curriculum";
import { GoddessScene } from "./GoddessScene";
import { SpeechBubble } from "./SpeechBubble";
import styles from "./HubMap.module.css";

interface Props {
  onSelect: (topic: Topic) => void;
  onAddCustom?: () => void;
  learnedCount?: number;
  streak?: number;
  hearts?: number;
}

export function HubMap({ onSelect, onAddCustom }: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const refs = useRef<Record<string, HTMLElement | null>>({});

  const firstPlayableHub = useMemo(() => {
    for (const h of CURRICULUM)
      for (const t of h.topics) if (t.packId) return h.id;
    return CURRICULUM[0]?.id ?? null;
  }, []);

  // 기본으로 훈련 가능한 허브 하나만 펼쳐둠
  const [openId, setOpenId] = useState<string | null>(firstPlayableHub);

  // 홈 = 여신 안내 + 2갈래 선택(choice) → 분야 고르면 펼침(fields)
  const [view, setView] = useState<"choice" | "fields">("choice");

  const results = useMemo(() => {
    const query = q.trim();
    if (!query) return null;
    const out: { hub: Section; topic: Topic }[] = [];
    for (const h of CURRICULUM)
      for (const t of h.topics)
        if (t.label.includes(query) || h.title.includes(query))
          out.push({ hub: h, topic: t });
    return out;
  }, [q]);

  function showToast(msg: string) {
    setToast(msg);
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast(null), 1600);
  }
  function tapTopic(topic: Topic) {
    if (topic.packId) onSelect(topic);
    else showToast(`'${topic.label}'는 곧 추가될 거예요!`);
  }

  return (
    <div className={styles.screen}>
      <div className={styles.scroll}>
        {view === "choice" ? (
          <>
            {/* 히어로 — 여신 + 말풍선 + 큰 태그라인 (강) */}
            <div className={styles.hero}>
              <div className={styles.heroChar}>
                <GoddessScene size={108} orb />
              </div>
              <SpeechBubble large>
                무엇부터 해 볼까요?
                <br />
                아래에서 하나를 골라 보세요
              </SpeechBubble>
            </div>
            <p className={styles.heroTagline}>
              잊혀 가는 단어를 기록하며
              <br />
              <span className={styles.heroEmph}>뇌근육</span>을 키워요
            </p>

            {/* 선택 1 — 내 단어 (약) */}
            {onAddCustom && (
              <button
                type="button"
                className={styles.choiceCard}
                onClick={onAddCustom}
              >
                <span className={styles.choiceIcon}>✏️</span>
                <span className={styles.choiceText}>
                  <span className={styles.choiceTitle}>잊은 단어 직접 적기</span>
                  <span className={styles.choiceDesc}>
                    생각이 안 나는 단어를 떠올려 기록해 보세요
                  </span>
                </span>
                <span className={styles.choiceArrow}>›</span>
              </button>
            )}

            {/* 선택 2 — 분야 (약) */}
            <button
              type="button"
              className={styles.choiceCard}
              onClick={() => setView("fields")}
            >
              <span className={styles.choiceIcon}>📂</span>
              <span className={styles.choiceText}>
                <span className={styles.choiceTitle}>분야별 단어 연습</span>
                <span className={styles.choiceDesc}>
                  영화·인물 등 주제를 골라 단어를 떠올리며 연습해요
                </span>
              </span>
              <span className={styles.choiceArrow}>›</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={styles.backChip}
              onClick={() => {
                setView("choice");
                setQ("");
              }}
            >
              ‹ 처음으로
            </button>

            {/* 분야 히어로 — 선택 화면과 동일 스타일 */}
            <div className={styles.hero}>
              <div className={styles.heroChar}>
                <GoddessScene size={108} orb />
              </div>
              <SpeechBubble large>
                어떤 분야를 볼까요?
                <br />
                탭하면 단어들이 펼쳐져요
              </SpeechBubble>
            </div>

            <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder=""
            aria-label="검색"
          />
          {q && (
            <button
              type="button"
              className={styles.clear}
              onClick={() => setQ("")}
              aria-label="검색 지우기"
            >
              ✕
            </button>
          )}
        </div>

        {results ? (
          <div className={styles.results}>
            {results.length === 0 ? (
              <p className={styles.noResult}>검색 결과가 없어요</p>
            ) : (
              results.map(({ hub, topic }) => {
                const playable = !!topic.packId;
                return (
                  <button
                    key={hub.id + topic.id}
                    type="button"
                    className={styles.resultRow}
                    onClick={() => tapTopic(topic)}
                  >
                    <span
                      className={`${styles.resultIcon} ${
                        playable ? styles.resultOpen : ""
                      }`}
                      style={{ "--hub": hub.color } as React.CSSProperties}
                    >
                      {playable ? topic.emoji : "🔒"}
                    </span>
                    <span className={styles.resultLabel}>{topic.label}</span>
                    <span className={styles.resultHub}>{hub.title}</span>
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <>
          {CURRICULUM.map((hub, idx) => {
            const open = openId === hub.id;
            const n = hub.topics.length;
            const twoRing = n > 10;
            const innerCount = twoRing ? 8 : n;
            const orbitH = twoRing ? 384 : 300;
            const openCount = hub.topics.filter((t) => t.packId).length;
            const premium = !!hub.group; // 프리미엄 그룹 = 잠김(회색)
            const showGroup =
              hub.group &&
              (idx === 0 || CURRICULUM[idx - 1].group !== hub.group);
            return (
              <Fragment key={hub.id}>
                {showGroup && (
                  <div className={styles.groupDivider}>
                    <span className={styles.premiumBadge}>👑 프리미엄 서비스</span>
                    <span className={styles.groupTitle}>{hub.group}</span>
                    <span className={styles.groupSub}>
                      나의 전문 용어와 경험을 모아 나만의 전문서를 만들어
                      보세요. 당신의 기억과 경험은 소중한 자산입니다.
                    </span>
                  </div>
                )}
                <section
                  ref={(el) => {
                    refs.current[hub.id] = el;
                  }}
                  className={styles.hub}
                  style={
                    {
                      "--hub": premium ? "var(--color-locked)" : hub.color,
                    } as React.CSSProperties
                  }
                >
                  <button
                    type="button"
                    className={`${styles.banner} ${open ? styles.bannerOpen : ""}`}
                    onClick={() =>
                      premium
                        ? showToast("프리미엄 서비스예요 · 준비 중")
                        : setOpenId(open ? null : hub.id)
                    }
                    aria-expanded={premium ? undefined : open}
                  >
                    <span className={styles.bannerEmoji}>{hub.emoji}</span>
                    <span className={styles.bannerTitle}>{hub.title}</span>
                    {premium ? (
                      <span className={styles.bannerLock}>🔒</span>
                    ) : (
                      <>
                        <span className={styles.bannerCount}>
                          {openCount}/{n}
                        </span>
                        <span className={styles.chevron}>
                          {open ? "▾" : "▸"}
                        </span>
                      </>
                    )}
                  </button>

                  {open && (
                    <div className={styles.orbit} style={{ height: orbitH }}>
                      <div className={styles.center}>
                        {hub.gif ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={hub.gif}
                            alt=""
                            className={styles.centerGif}
                          />
                        ) : (
                          <GoddessScene size={92} orb />
                        )}
                      </div>
                      {hub.topics.map((topic, i) => {
                        const playable = !!topic.packId;
                        const ring = i < innerCount ? 0 : 1;
                        const idxInRing = ring === 0 ? i : i - innerCount;
                        const countInRing =
                          ring === 0 ? innerCount : n - innerCount;
                        const R = twoRing ? (ring === 0 ? 90 : 158) : 116;
                        const ang =
                          -Math.PI / 2 + (idxInRing / countInRing) * Math.PI * 2;
                        const x = Math.round(Math.cos(ang) * R);
                        const y = Math.round(Math.sin(ang) * R);
                        return (
                          <button
                            key={topic.id}
                            type="button"
                            className={`${styles.node} ${
                              playable ? styles.nodeOpen : styles.nodeLocked
                            }`}
                            style={{
                              left: "50%",
                              top: "50%",
                              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                            }}
                            onClick={() => tapTopic(topic)}
                            aria-label={`${topic.label}${
                              playable ? "" : " (준비 중)"
                            }`}
                          >
                            <span className={styles.bubble}>
                              {!playable && (
                                <span className={styles.lock}>🔒</span>
                              )}
                              <span className={styles.emoji}>{topic.emoji}</span>
                            </span>
                            <span className={styles.label}>{topic.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              </Fragment>
            );
          })}

            <div className={styles.tail}>주제가 점점 더 열릴 거예요 ✨</div>
              </>
            )}
          </>
        )}
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
