// 마이크 입력 버튼. 듣는 중에는 빨갛게 펄스. 색은 토큰 경유.
import styles from "./MicButton.module.css";

interface Props {
  listening: boolean;
  onClick: () => void;
}

export function MicButton({ listening, onClick }: Props) {
  return (
    <button
      type="button"
      className={`${styles.mic} ${listening ? styles.listening : ""}`}
      onClick={onClick}
      aria-label={listening ? "녹음 중지" : "마이크로 말하기"}
      aria-pressed={listening}
    >
      🎤
    </button>
  );
}
