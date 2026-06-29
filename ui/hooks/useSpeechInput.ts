// ui 레이어 훅 — 브라우저 음성 인식(Web Speech API)으로 텍스트 입력.
// window/SpeechRecognition는 브라우저 전용이라 UI 레이어에만 둔다(logic은 DOM 비의존).
// 지원: Chrome·Edge(데스크톱/안드로이드). 미지원(iOS Safari 등) → status="unsupported".

import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechStatus = "idle" | "listening" | "unsupported";

interface Options {
  /** 인식 언어. 기본 한국어. */
  lang?: string;
  /** 인식 결과(중간 결과 포함)를 받을 콜백. */
  onResult: (text: string) => void;
}

export function useSpeechInput({ lang = "ko-KR", onResult }: Options) {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const recognitionRef = useRef<any>(null);
  // 콜백을 ref로 보관해 인식 인스턴스를 재생성하지 않는다.
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    const SRClass: any =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition);

    if (!SRClass) {
      setStatus("unsupported");
      return;
    }

    const rec: any = new SRClass();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      const text = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join("");
      onResultRef.current(text);
    };
    rec.onend = () => setStatus("idle");
    rec.onerror = () => setStatus("idle");

    recognitionRef.current = rec;

    return () => {
      rec.onresult = null;
      rec.onend = null;
      rec.onerror = null;
      try {
        rec.abort();
      } catch {
        // 이미 종료된 경우 무시.
      }
    };
  }, [lang]);

  const start = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.start();
      setStatus("listening");
    } catch {
      // 이미 시작된 상태면 무시.
    }
  }, []);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      // 무시.
    }
  }, []);

  return { status, start, stop };
}
