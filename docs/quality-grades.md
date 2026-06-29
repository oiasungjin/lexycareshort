# docs/quality-grades.md — 품질 등급·알려진 결함·미정 사항

> Cold-tier. 매월 첫째 금요일 갱신 권장. 등급 A(견고)~F(부재).

## 레이어별 현재 등급

| 레이어 | 등급 | 메모 |
|---|---|---|
| content | B | `schema.ts` + `movies.ko.json`(말죽거리 잔혹사 3힌트). 카테고리·다국어 확장 여지. |
| domain | B | `Card`/`RecallRecord`/`RecallGrade`/`TrainingItem` 정의. |
| logic | B | `scoring`·`record-store`(+localStorage)·`session`. 유닛테스트 9개 통과. SRS 스케줄 미구현(정상). |
| ui | B | Duolingo 토큰 + DuoButton/ProgressBar/HintImage/CardTrainer. 빌드·렌더 검증 완료. |

MVP 데모 1화면(말죽거리 잔혹사) 동작 확인. lexi-reviewer 검수 🔴 3건(테스트·디자인 격리) 반영 완료.

## 알려진 결함 / 리스크

- 없음(코드 없음). 첫 구현 후 여기에 기록.

## 미정 사항 (사용자 입력 대기)

| 항목 | 상태 | 결정 시 영향 레이어 |
|---|---|---|
| 카드 카테고리 최종 목록 | 미정 | content |
| 정답 입력 방식(타이핑/음성) | 미정 | ui, logic |
| 훈련 반복 정책(재노출/SRS) | 미정 | logic |
| 다국어 범위(ko/ja/…) | 미정 | content |
| 디자인 상세·그림 프롬프트 | 사용자 제공 예정 | ui, content |
| 저장 백엔드(브라우저/서버) | 미정(MVP는 브라우저) | logic |

## 결정 로그

- 2026-06-26: 스택 Next.js+React, 프론트 위주, 브라우저 저장 우선 확정.
- 2026-06-26: 최우선 비기능 요구 = 시장조사 후 교체 용이성. content·design 양 끝 격리로 대응.
