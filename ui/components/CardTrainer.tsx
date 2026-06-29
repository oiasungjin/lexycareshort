"use client";

// 듀오링고식 레슨 + 게이미피케이션:
// 상단바(✕ · 진행바 · 🔥콤보) → 카드(힌트) → 캐릭터(여신, 감정반응)+말풍선 → 입력
// → 하단 축하/격려 배너. 정답 시 컨페티 + +XP + 캐릭터 점프, 오답 시 입력 흔들림 + 시무룩.

import { useMemo, useState } from "react";
import type { Card } from "@/content/schema";
import { compareAnswer } from "@/logic/scoring";
import { createLocalStorageStore } from "@/logic/record-store.localstorage";
import type { RecordStore } from "@/logic/record-store";
import type { RecallGrade } from "@/domain";
import { DuoButton } from "./DuoButton";
import { ProgressBar } from "./ProgressBar";
import { HintImage } from "./HintImage";
import { HintCarousel } from "./HintCarousel";
import { MicButton } from "./MicButton";
import { MarbleTray } from "./MarbleTray";
import { GoddessScene } from "./GoddessScene";
import { SpeechBubble } from "./SpeechBubble";
import { Confetti } from "./Confetti";
import { LessonComplete } from "./LessonComplete";
import { useSpeechInput } from "@/ui/hooks/useSpeechInput";
import { playCorrect, playWrong } from "@/ui/lib/sfx";
import styles from "./CardTrainer.module.css";

type Phase = "guessing" | "checked" | "complete";
type Result = "correct" | "partial" | "wrong";

const MARBLE_GOAL = 10;
const START_HEARTS = 5;

interface Props {
  cards: Card[];
  store?: RecordStore;
  /** 카테고리 라벨(주제명). 없으면 카드의 category. */
  title?: string;
  /** 레슨 나가기(학습 경로로 복귀). */
  onExit?: () => void;
  /** 상단 ✕ 숨김(탭바의 뒤로가기를 쓸 때). */
  hideClose?: boolean;
  /** record: 그림→이름·에피소드 기록 / train: 에피소드→이름 떠올리기. */
  mode?: "record" | "train";
  /** train 모드에서 문제로 보여줄 카드별 에피소드(cardId→텍스트). */
  episodes?: Record<string, string>;
  /** train 4지선다 보기 풀(정답+오답 후보 이름들). */
  choicePool?: string[];
}

export function CardTrainer({
  cards,
  store: injected,
  title,
  onExit,
  hideClose,
  mode = "record",
  episodes,
  choicePool,
}: Props) {
  const isTrain = mode === "train";
  const store = useMemo(() => injected ?? createLocalStorageStore(), [injected]);

  const [cardIndex, setCardIndex] = useState(0);
  const card = cards[cardIndex];
  const hints = card.hints;

  // train 4지선다 보기 — 카드마다 정답 + 오답 3개 섞기(카드 바뀔 때만 재계산)
  const choices = useMemo(() => {
    if (!isTrain) return [] as string[];
    const correct = card.answer.primary;
    const pool = (choicePool ?? cards.map((c) => c.answer.primary)).filter(
      (n) => n !== correct,
    );
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const opts = [correct, ...pool.slice(0, 3)];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrain, card.id]);

  const [hintIndex, setHintIndex] = useState(0);
  const [maxSeen, setMaxSeen] = useState(0);
  const [input, setInput] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState<Phase>("guessing");
  const [result, setResult] = useState<Result | null>(null);
  const [marbles, setMarbles] = useState(0);
  const [streak, setStreak] = useState(0);
  const [shake, setShake] = useState(false);
  const [xp, setXp] = useState(0);
  const [xpBonus, setXpBonus] = useState(0);
  const [hearts, setHearts] = useState(START_HEARTS);
  // 세션(레슨) 누적 정산
  const [totalXp, setTotalXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const speech = useSpeechInput({ onResult: setInput });

  // 전체 카드 중 완료(채점된) 개수 진행도. cards.length 기준이라 카드를 추가하면 자동 반영.
  const progress =
    (cardIndex + (phase === "guessing" ? 0 : 1)) / cards.length;

  function goNext() {
    setHintIndex((i) => {
      const next = Math.min(i + 1, hints.length - 1);
      setMaxSeen((m) => Math.max(m, next));
      return next;
    });
  }
  function goPrev() {
    setHintIndex((i) => Math.max(i - 1, 0));
  }

  function check(value?: string) {
    const ans = (value ?? input).trim();
    if (!ans || (!isTrain && !description.trim())) return;
    const r = compareAnswer(ans, card.answer);
    const correct = r === "correct";
    const newStreak = correct ? streak + 1 : 0;
    const base = correct ? (maxSeen === 0 ? 15 : 10) : 0;
    // 콤보 보너스: 연속 정답이 쌓일수록 추가 XP (최대 +25)
    const comboBonus =
      correct && newStreak >= 2 ? Math.min((newStreak - 1) * 5, 25) : 0;
    const gain = base + comboBonus;
    const grade: RecallGrade =
      r === "correct" ? "got" : r === "partial" ? "partial" : "forgot";
    setResult(r);
    setAnswered((a) => a + 1);
    if (correct) {
      playCorrect();
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      setMarbles((m) => Math.min(MARBLE_GOAL, m + 1));
      setXp(gain);
      setXpBonus(comboBonus);
      setTotalXp((t) => t + gain);
      setCorrectCount((c) => c + 1);
    } else {
      playWrong();
      setStreak(0);
      setHearts((h) => Math.max(0, h - 1));
      setMarbles((m) => Math.max(0, m - 1));
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
    }
    store.save({
      cardId: card.id,
      input: ans,
      description: isTrain ? undefined : description.trim() || undefined,
      grade,
      hintsUsed: maxSeen,
      ts: Date.now(),
    });
    setPhase("checked");
  }

  function clearCard() {
    setHintIndex(0);
    setMaxSeen(0);
    setInput("");
    setDescription("");
    setResult(null);
    setPhase("guessing");
  }

  // "계속하기"/건너뛰기: 하트 소진 또는 마지막 카드면 완료 화면으로.
  function next() {
    if (hearts <= 0 || cardIndex >= cards.length - 1) {
      setPhase("complete");
      return;
    }
    setCardIndex((i) => i + 1);
    clearCard();
  }

  // 이전 카드로
  function prev() {
    if (cardIndex <= 0) return;
    setCardIndex((i) => i - 1);
    clearCard();
  }

  // 레슨 다시 시작: 정산 초기화(구슬은 유지).
  function restart() {
    setCardIndex(0);
    setStreak(0);
    setHearts(START_HEARTS);
    setTotalXp(0);
    setCorrectCount(0);
    setAnswered(0);
    setBestStreak(0);
    clearCard();
  }

  const correct = result === "correct";
  const mood = phase === "guessing" ? "idle" : correct ? "happy" : "sad";
  const bubbleText =
    phase === "guessing" ? (
      isTrain ? (
        "이 에피소드의 이름을 떠올려 보세요!"
      ) : (
        <>
          그림의 제목이나 이름,
          <br />
          에피소드(경험)을 입력해 주세요.
        </>
      )
    ) : correct ? (
      "잘했어! ✨"
    ) : (
      "괜찮아, 같이 외워보자!"
    );

  const footerClass = [
    styles.bottom,
    phase === "checked" && correct ? styles.barGreen : "",
    phase === "checked" && result === "wrong" ? styles.barRed : "",
    phase === "checked" && result === "partial" ? styles.barOrange : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (phase === "complete") {
    return (
      <LessonComplete
        totalXp={totalXp}
        correctCount={correctCount}
        answered={answered}
        bestStreak={bestStreak}
        outOfHearts={hearts <= 0}
        onRestart={restart}
        onHome={onExit}
      />
    );
  }

  return (
    <div className={styles.screen}>
      {phase === "checked" && correct && <Confetti />}

      {/* 상단바: ✕ · 진행바 · 콤보 */}
      <header className={styles.topbar}>
        {!hideClose && (
          <button
            type="button"
            className={styles.close}
            onClick={onExit ?? next}
            aria-label="나가기"
          >
            ✕
          </button>
        )}
        <button
          type="button"
          className={styles.navPrev}
          onClick={prev}
          disabled={cardIndex === 0}
          aria-label="이전 카드"
        >
          ‹
        </button>
        <div className={styles.progress}>
          <ProgressBar value={progress} />
        </div>
      </header>

      <main className={styles.main} key={cardIndex}>
        {isTrain ? (
          <div className={styles.episodeQ}>
            <span className={styles.episodeLabel}>이 에피소드의 이름은?</span>
            <p className={styles.episodeText}>{episodes?.[card.id]}</p>
          </div>
        ) : phase === "guessing" ? (
          <HintCarousel
            hints={hints}
            index={hintIndex}
            onPrev={goPrev}
            onNext={goNext}
            category={title ?? card.category}
          />
        ) : (
          <HintImage
            hint={hints[hintIndex]}
            category={title ?? card.category}
          />
        )}

        {/* 캐릭터(여신) + 말풍선 — 그림 아래, 입력 위 */}
        <div className={styles.charRow}>
          <div className={styles.char}>
            <GoddessScene size={80} mood={mood} />
          </div>
          <SpeechBubble>{bubbleText}</SpeechBubble>
        </div>

        {phase === "guessing" && isTrain && (
          <div className={`${styles.choices} ${shake ? styles.shake : ""}`}>
            {choices.map((c) => (
              <button
                key={c}
                type="button"
                className={styles.choice}
                onClick={() => check(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {phase === "guessing" && !isTrain && (
          <div className={`${styles.inputRow} ${shake ? styles.shake : ""}`}>
            <input
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && check()}
              placeholder="그림의 이름을 입력하세요"
              aria-label="떠오르는 단어 입력"
              autoFocus
            />
            {speech.status !== "unsupported" && (
              <MicButton
                listening={speech.status === "listening"}
                onClick={() =>
                  speech.status === "listening" ? speech.stop() : speech.start()
                }
              />
            )}
          </div>
        )}

        {phase === "guessing" && !isTrain && (
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이 단어와 관련된 에피소드(경험)을 자유롭게 기록해 보세요."
            aria-label="에피소드 입력"
            rows={2}
          />
        )}
      </main>

      {/* 하단: 확인 / 축하·격려 배너 */}
      <footer className={footerClass}>
        {phase === "guessing" && isTrain && (
          <DuoButton variant="ghost" onClick={next} fullWidth>
            건너뛰기
          </DuoButton>
        )}

        {phase === "guessing" && !isTrain && (
          <div className={styles.actionRow}>
            <DuoButton variant="ghost" onClick={next}>
              건너뛰기
            </DuoButton>
            <div className={styles.confirmWrap}>
              <DuoButton
                variant="primary"
                onClick={() => check()}
                disabled={!input.trim() || !description.trim()}
                fullWidth
              >
                확인
              </DuoButton>
            </div>
          </div>
        )}

        {phase === "checked" && (
          <div className={styles.feedback}>
            {correct && (
              <span className={styles.xpPop} key={cardIndex}>
                +{xp} XP{xpBonus > 0 ? ` 🔥+${xpBonus}` : ""}
              </span>
            )}
            <div className={styles.resultRow}>
              <span
                className={[
                  styles.resultBadge,
                  correct ? styles.badgeGreen : styles.badgeRed,
                ].join(" ")}
              >
                {correct ? "✓" : "!"}
              </span>
              <div className={styles.resultText}>
                <span className={styles.resultHead}>
                  {correct
                    ? isTrain
                      ? "정답입니다!"
                      : "정답이에요!"
                    : result === "partial"
                      ? "거의 맞았어요"
                      : "아쉬워요"}
                </span>
                <strong
                  className={`${styles.resultAnswer} ${
                    correct ? styles.answerGreen : styles.answerRed
                  }`}
                >
                  {card.answer.primary}
                </strong>
              </div>
            </div>

            <MarbleTray count={marbles} mode={correct ? "gain" : "break"} />

            <DuoButton
              variant={correct ? "success" : "danger"}
              onClick={next}
              fullWidth
            >
              {isTrain ? "다음" : "계속하기"}
            </DuoButton>
          </div>
        )}
      </footer>
    </div>
  );
}
