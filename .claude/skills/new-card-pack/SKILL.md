---
name: new-card-pack
description: >-
  렉시케어 간단버전에 새 그림→단어 카드팩을 추가한다. 주제(영화·사람이름·사물 등)와
  로케일을 받아 content/packs/{주제}.{locale}.json 을 스키마에 맞게 생성하고,
  카드(자극 그림 자리표시자 + 정답 단어 + 카테고리·난이도)를 채운다.
  "카드팩 추가", "새 주제 카드", "단어 세트 만들기" 요청 시 사용. lexi-content 주도.
---

# new-card-pack — 새 카드팩 추가

`content/` 레이어에 카드팩 하나를 추가한다. 콘텐츠 격리 규칙(`docs/architecture.md` §5)을 지킨다.

## 1. 입력 확인
- **주제**(category)와 **locale**(ko/ja 등). 안 주면 사용자에게 묻는다.
- 카테고리 최종 목록은 미정일 수 있음 → `docs/quality-grades.md` 확인. 임의 확정 금지, 사용자 의도 따름.

## 2. 스키마 준수
- `content/schema.ts`의 `Card` 타입을 단일 출처로 사용. 없으면 먼저 `/scaffold-app` 또는 lexi-content로 스키마 정의.
- 카드 필드: `id`, `category`, `stimulus(imagePrompt/imagePath 자리표시자 + 출처 메모)`, `answer(정답 + 허용 표기)`, `difficulty`, `locale`.

## 3. 카드 채우기
- 파일: `content/packs/{주제}.{locale}.json`.
- 그림은 **자리표시자**(`imagePrompt` 또는 빈 경로). 실제 이미지는 사용자가 추후 제공 — 임의 생성 금지.
- 정답 단어는 인출 난이도·일상성 고려. 필요 시 전체버전 자산(`../렉시케어/명사*.json`, 빈도분석)을 참고하고 출처 메모.
- 순수 JSON 데이터만. 로직·React 금지.

## 4. 검증 후 보고
- 스키마 타입 통과 확인(`npm run typecheck`).
- 추가한 카드 수·미정 항목(그림·카테고리 확정 여부) 보고, `lexi-reviewer` 검수 권유.
