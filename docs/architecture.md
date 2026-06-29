# docs/architecture.md — 레이어와 의존 방향

> Cold-tier. 바뀔 일이 드문 영속 규칙. 이 MVP의 최우선 목표는 **시장조사 후 디자인·기능 교체 용이성**이며, 아래 모든 규칙은 그 목표에서 도출됨.

## 1. 왜 레이어를 강제하는가

시장조사 후 디자인을 통째로 갈거나, 카드 콘텐츠를 다른 주제로 바꾸거나, 훈련 정책을 교체할 일이 반드시 생김. 레이어를 분리해 두면 **한 레이어만 바꿔도 나머지가 안 깨짐.** 에이전트가 매번 "이 코드 어디 둘까"를 다르게 정하는 걸 막는 것도 목적.

핵심 원칙: **영리한 추상화보다 단순·교체 가능.** 잘 모르겠으면 한 군데 더 단순하게.

## 2. 레이어 정의 (단방향 의존)

```
content  →  domain  →  logic  →  ui
  ↓          ↓         ↓        ↓
[하위는 상위를 모름. 역방향 import 금지.]
```

**content 레이어** — `content/`
- 카드 데이터: 그림 메타(경로/프롬프트/출처), 정답 단어, 카테고리, 난이도, 다국어 단어.
- 순수 데이터(JSON/TS 상수)만. 로직·React 금지.
- 카드팩 단위로 파일 분리 → 주제 교체 = 파일 교체.
- 예: `content/packs/movies.ko.json`, `content/packs/faces.ko.json`, `content/schema.ts`

**domain 레이어** — `domain/`
- 타입·값객체·규칙. `Card`, `Stimulus`, `RecallRecord`, `TrainingItem`, `RecallGrade`.
- 의존 허용: content(타입 참조만).
- 프레임워크 비의존(React·Next·localStorage 모름). 순수 TypeScript.
- 예: `domain/card.ts`, `domain/record.ts`

**logic 레이어** — `logic/`
- 유즈케이스: 훈련 세션 엔진, 정답 채점, 반복 스케줄, 기록 저장소(추상 인터페이스 + localStorage 구현).
- 의존 허용: content, domain.
- UI·React 비의존 → 추후 다른 UI/플랫폼에 그대로 재사용.
- 예: `logic/session-engine.ts`, `logic/record-store.ts`, `logic/scoring.ts`

**ui 레이어** — `ui/` (Next.js `app/` 포함)
- React 컴포넌트, 페이지, 디자인 토큰, 스타일.
- 의존 허용: 모든 하위 레이어.
- **디자인은 전부 여기.** 시장조사 후 디자인 교체 = ui만 수정.
- 예: `ui/components/CardView.tsx`, `ui/tokens/`, `app/page.tsx`

## 3. 폴더 구조 (목표)

```
렉시케어간단버전/
  app/                  # Next.js App Router 진입(ui의 일부)
  content/
    schema.ts
    packs/{주제}.{locale}.json
  domain/
  logic/
  ui/
    components/
    tokens/             # 색·여백·타이포 토큰 (디자인 단일 출처)
  docs/  .claude/  .harness/
```

@assumption: Next.js 단일 앱. 추후 모바일/별도 백엔드 분리 시 content·domain·logic은 그대로 이식.

## 4. 명명 규약

- 파일: 컴포넌트 `PascalCase.tsx`, 그 외 TS `kebab-case.ts`, 문서 `kebab-case.md`.
- 타입·컴포넌트: `PascalCase`. 함수·변수: `camelCase`. 상수: `SCREAMING_SNAKE_CASE`.
- 카드팩: `content/packs/{주제}.{locale}.json` (예: `movies.ko.json`).
- 테스트: `{대상}.test.ts`.

## 5. 디자인·콘텐츠 격리 규칙 (이 프로젝트의 1급 규칙)

- 색·여백·폰트·라운드 등 모든 디자인 값은 `ui/tokens/`에만. 컴포넌트에 리터럴 하드코딩 금지.
- 그림·단어·카테고리 등 모든 콘텐츠는 `content/`에만. 컴포넌트·로직에 하드코딩 금지.
- 이 둘을 지키면 "디자인 교체"·"콘텐츠 교체"가 각각 한 레이어 수정으로 끝남.

## 6. 파일 크기 상한

- TS/TSX: 250줄. Markdown: 500줄(`docs/agents/*`는 200줄, `AGENTS.md`는 100줄). JSON 카드팩: 상한 없음(데이터).

## 7. 테스트 요구 (MVP 수준, 가볍게)

- domain·logic: 핵심 함수(채점·스케줄·저장) 유닛 테스트. 과한 커버리지 강요 안 함.
- ui: 수동 확인 우선. 핵심 흐름 1개만 가볍게.
- MVP 단계에서 테스트가 속도를 죽이면 줄일 것 — 단, 채점·기록 저장은 항상 검증.

## 8. 금지 사항

- 역방향 import / 같은 레이어 순환 의존.
- `content`·`domain`·`logic`에서 React·Next·DOM·localStorage 직접 사용(저장은 logic의 인터페이스 뒤로).
- 디자인 값·콘텐츠 하드코딩(§5 위반).
- `utils/`·`helpers/`·`common/` 폴더.
- MVP에 불필요한 백엔드·인증·DB·상태관리 라이브러리 선도입.
- 묻지 않은 기능 추가.

## 9. 변경 절차

레이어·폴더 경계 변경 시: ① 이 문서 ② `docs/quality-grades.md` ③ `AGENTS.md` 링크를 함께 갱신. 변경 후 `lexi-reviewer`로 검수.

---

## 설계 근거

planb4u harness의 `Data→Domain→Service→Report→UI`를 프론트 위주 MVP에 맞게 4단(`content→domain→logic→ui`)으로 축약했음. Report 레이어는 이 앱에 불필요해 제거. content를 최하위 독립 레이어로 끌어올린 건, 이 앱에서 "그림→단어 콘텐츠"와 "디자인"이 시장조사로 가장 자주 바뀔 두 축이기 때문 — 둘을 양 끝(content/ui)에 격리해 교체 비용을 최소화함.
