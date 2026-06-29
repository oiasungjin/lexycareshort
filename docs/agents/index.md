# docs/agents/index.md — 서브에이전트 위임 지도

> 이 앱의 커스텀 서브에이전트 목록과 위임 기준. 실제 정의는 `.claude/agents/{이름}.md`.
> 목적은 역할 분담이 아니라 **컨텍스트 격리** — 각 에이전트는 자기 레이어 문맥만 들고 작업해 메인 세션을 가볍게 유지함.

## 에이전트 목록

| 이름 | 담당 레이어 | 한 줄 책임 |
|---|---|---|
| **lexi-content** | `content/` | 그림→단어 카드·카드팩·스키마·다국어 단어 관리. |
| **lexi-recall** | `logic/`, `domain/` | 훈련 세션 엔진·채점·반복 스케줄·기록 저장 로직. |
| **lexi-ui** | `ui/`, `app/` | 깨끗한 UI·디자인 토큰·핵심 컴포넌트. 디자인 교체 쉬운 구조. |
| **lexi-reviewer** | (읽기전용 전체) | 레이어 경계·MVP 단순성·교체 용이성 검수. 저작 금지. |

## 위임 판단 기준

| 요청 | 위임 대상 |
|---|---|
| "영화/얼굴 카드팩 추가", "정답 단어·카테고리·난이도 손질" | lexi-content |
| "훈련 흐름 구현", "채점·반복·기록 저장 로직" | lexi-recall |
| "카드 화면·입력 UI", "디자인 토큰·테마", "깨끗하게 다듬기" | lexi-ui |
| "이거 레이어 안 깨졌나", "MVP에 과한 거 없나", "교체하기 쉬운가" | lexi-reviewer |
| 전부 결합·최종 결정·사용자 대면 | 메인(오케스트레이터) — 위임 금지 |

## 협업 규율

- **저작 ↔ 검수 분리**: lexi-content/recall/ui 가 작성 → 별도 패스로 `lexi-reviewer` 검수. 같은 컨텍스트에서 자기 승인 금지.
- **레이어 침범 금지**: lexi-ui 가 채점 로직을 직접 짜지 않음 → lexi-recall 에 위임. content·domain·logic 에 React 섞지 않음.
- **2개 이상 독립 작업은 병렬 위임** 가능(예: content 카드팩 + ui 토큰 동시).
- **컨텍스트 절약**: 각 에이전트는 자기 레이어 파일과 `docs/architecture.md`만 읽음. 다른 에이전트의 중간 작업 내역은 보지 않음.

## 스킬 연계

- `/scaffold-app` → 보통 lexi-ui 주도(+ 골격은 전 레이어 폴더 생성).
- `/new-card-pack` → lexi-content.
- `/new-feature-slice` → domain→logic→ui 순으로 lexi-recall + lexi-ui 협업.
