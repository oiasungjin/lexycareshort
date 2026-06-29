// 서버 전용 라우트 — 관리자 통계 접근의 '진짜' 게이트.
// 패스코드(ADMIN_PASSCODE)와 서비스 키(SUPABASE_SERVICE_ROLE_KEY)는 서버 환경변수로만 존재하며
// 클라이언트 번들에 포함되지 않는다. 통계 함수는 anon 호출이 차단돼 있어, 검증을 통과한
// 이 서버만 service_role 로 호출할 수 있다.
import { NextResponse } from "next/server";
import { SUPABASE_URL } from "@/logic/supabase-config";

// 환경변수를 런타임에 읽으므로 정적 최적화 대상에서 제외.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSCODE;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!expected || !serviceKey) {
    return NextResponse.json({ error: "server_not_configured" }, { status: 500 });
  }

  let passcode: unknown;
  try {
    passcode = (await req.json())?.passcode;
  } catch {
    passcode = undefined;
  }
  if (typeof passcode !== "string" || passcode !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/simple_recall_stats`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: "{}",
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json({ error: "stats_failed" }, { status: 502 });
  }
  return NextResponse.json(await res.json());
}
