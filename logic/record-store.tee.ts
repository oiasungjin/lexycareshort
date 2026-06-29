// logic 레이어 — RecordStore 데코레이터: 로컬 저장 + 원격 싱크 동시 기록.
// 읽기/삭제는 로컬에 그대로 위임하고, 쓰기만 원격으로 미러링한다(관리자 수집용).
// 로컬 저장이 진실의 원천(사용자 UX), 원격은 누적 통계 수집.

import type { RecordStore } from "@/logic/record-store";
import type { RemoteEventSink } from "@/logic/remote-sink";

export function withRemoteSink(
  local: RecordStore,
  sink: RemoteEventSink,
): RecordStore {
  return {
    save(record) {
      local.save(record);
      sink.send(record);
    },
    all() {
      return local.all();
    },
    forCard(cardId) {
      return local.forCard(cardId);
    },
    remove(predicate) {
      local.remove(predicate);
    },
  };
}
