// 캐릭터(여신) 옆 말풍선. 왼쪽을 향하는 꼬리.
import styles from "./SpeechBubble.module.css";

export function SpeechBubble({
  children,
  large,
}: {
  children: React.ReactNode;
  large?: boolean;
}) {
  return (
    <div
      className={`${styles.bubble} ${large ? styles.large : ""}`}
      role="status"
    >
      {children}
    </div>
  );
}
