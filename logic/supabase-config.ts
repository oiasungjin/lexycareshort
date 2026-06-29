// logic 레이어 — 간단버전 데이터 수집용 Supabase 공개 설정.
// anon/publishable 키는 '클라이언트 노출 전제' 키(RLS로 보호)라 저장소에 포함해도 안전하다.
// 실제 보안은 RLS 정책으로: 공개(anon)는 simple_recall_events INSERT만 가능하고
// 원시 행 읽기는 불가, 통계는 집계만 반환하는 함수(simple_recall_stats)로만 노출.
export const SUPABASE_URL = "https://tzujbipqsztcpbeebgzq.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_buFEbmDWijfyKlnbqfyvVw_MgxNWXmz";
