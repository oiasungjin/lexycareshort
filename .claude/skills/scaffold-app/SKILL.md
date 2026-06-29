---
name: scaffold-app
description: >-
  렉시케어 간단버전의 Next.js 레이어드 골격을 1회 부트스트랩한다. content→domain→logic→ui
  레이어 폴더, 디자인 토큰 자리, 빈 카드 스키마, RecordStore 인터페이스, 핵심 화면 스텁,
  npm 스크립트(dev/build/typecheck)를 생성한다. 앱 코드가 아직 없을 때(최초 1회) 사용.
  "앱 골격", "scaffold", "부트스트랩", "프로젝트 세팅" 요청 시.
---

# scaffold-app — 레이어드 앱 골격 부트스트랩

`docs/architecture.md`의 레이어 구조대로 **최소 골격만** 만든다. 동작하는 빈 앱이 목표 — 화려함·기능 과잉 금지.

## 0. 선행 확인
- 이미 `app/`·`package.json`이 있으면 **중단하고 보고**(덮어쓰기 금지). 이 스킬은 최초 1회.
- `docs/architecture.md` §3 폴더 구조를 따른다.

## 1. Next.js 앱 생성
- App Router + TypeScript. `app/` 진입. 가능하면 `create-next-app` 비대화형:
  `npx create-next-app@latest . --ts --app --eslint --no-tailwind --no-src-dir --use-npm` (대화형 플래그 주의, 실패 시 수동 골격).
- 설치·빌드는 `run_in_background`.

## 2. 레이어 폴더 + 스텁 생성
```
content/schema.ts            # Card/Stimulus 타입 자리(주석 + 빈 타입)
content/packs/.gitkeep
domain/index.ts              # RecallGrade, RecallRecord, TrainingItem 자리
logic/record-store.ts        # RecordStore 인터페이스(추상)
logic/record-store.localstorage.ts  # 미구현 스텁
logic/scoring.ts             # compareAnswer 스텁
logic/session-engine.ts      # nextCard 스텁
ui/tokens/index.ts           # 색·여백·타이포 토큰 자리(중립 기본값)
ui/components/CardView.tsx    # 그림 자리표시자 박스
ui/components/AnswerInput.tsx
ui/components/Reveal.tsx
app/page.tsx                 # 홈 → 세션 진입
```
- 모든 스텁은 타입이 통과하는 최소 코드 + `// TODO(사용자입력): ...` 주석으로 미정 표시.
- 디자인 토큰은 중립값(흰 배경·검정 텍스트·기본 여백). 깨끗한 기본형.

## 3. 레이어 규칙 주입
- `content`·`domain`·`logic`에는 React import 절대 넣지 않음.
- 저장은 `RecordStore` 인터페이스 + localStorage 구현 한 곳에만.

## 4. 검증 후 보고
- `npm run typecheck`(background) 통과 확인.
- 위임: UI 스텁은 lexi-ui, 스키마·타입은 lexi-recall/content 에 넘겨 채워도 됨.
- 완료 후 `WORKBOARD.md`·`docs/quality-grades.md` 등급 갱신, `lexi-reviewer` 검수 권유.

## 산출 보고
생성한 폴더·파일 목록, typecheck 결과, 다음 단계(`/new-card-pack`, 핵심 흐름 구현)를 간결체로.
