// 힌트 그림 표시. 실제 imagePath가 있으면 이미지를, 없으면 리버스(rebus)
// 자리표시자(이모지/글자 조각)를 보여준다. 실제 이미지는 사용자가 추후 제공.
import type { Hint } from "@/content/schema";
import styles from "./HintImage.module.css";

interface Props {
  hint: Hint;
  /** 캔버스 위에 겹쳐 그릴 오버레이(예: 좌우 화살표). */
  overlay?: React.ReactNode;
  /** 그림 안에 표시할 범주 배지(예: 영화). */
  category?: string;
}

export function HintImage({ hint, overlay, category }: Props) {
  return (
    <figure className={styles.frame}>
      <div className={styles.canvas} data-kind={hint.kind}>
        {category && <span className={styles.badge}>{category}</span>}
        {hint.imagePath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hint.imagePath} alt={hint.caption} className={styles.img} />
        ) : (
          <div className={styles.rebus}>
            {(hint.pieces ?? ["❓"]).map((p, i) => (
              <span key={i} className={styles.piece}>
                {p}
              </span>
            ))}
          </div>
        )}
        {overlay}
      </div>
      {hint.caption && (
        <figcaption className={styles.caption}>{hint.caption}</figcaption>
      )}
    </figure>
  );
}
