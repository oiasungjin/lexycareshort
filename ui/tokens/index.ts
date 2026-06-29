// ui/tokens — TS에서 토큰을 참조해야 할 때의 미러. CSS 변수가 1차 출처.
// JS 로직에서 색을 직접 쓰지 말고 가급적 CSS 변수를 쓸 것.

export const tokens = {
  color: {
    featherGreen: "var(--color-feather-green)",
    skyBlue: "var(--color-sky-blue)",
    beeOrange: "var(--color-bee-orange)",
    cardinalRed: "var(--color-cardinal-red)",
    eelGrey: "var(--color-eel-grey)",
    polarLight: "var(--color-polar-light)",
    white: "var(--color-white)",
  },
  radius: {
    card: "var(--radius-card)",
    chip: "var(--radius-chip)",
    pill: "var(--radius-pill)",
  },
} as const;
