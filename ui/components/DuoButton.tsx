// 듀오링고형 3D 입체 버튼. 색은 토큰에서, variant로만 선택.
import styles from "./DuoButton.module.css";

type Variant = "primary" | "success" | "warn" | "danger" | "ghost";

interface Props {
  variant?: Variant;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
}

export function DuoButton({
  variant = "primary",
  children,
  onClick,
  disabled,
  type = "button",
  fullWidth,
}: Props) {
  const cls = [styles.btn, styles[variant], fullWidth ? styles.full : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={cls} onClick={onClick} disabled={disabled} type={type}>
      {children}
    </button>
  );
}
