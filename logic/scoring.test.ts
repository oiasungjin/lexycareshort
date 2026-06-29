import { describe, it, expect } from "vitest";
import { compareAnswer } from "@/logic/scoring";
import type { Answer } from "@/content/schema";

const answer: Answer = {
  primary: "말죽거리 잔혹사",
  accept: ["말죽거리잔혹사"],
};

describe("compareAnswer", () => {
  it("정답 정확 일치 → correct", () => {
    expect(compareAnswer("말죽거리 잔혹사", answer)).toBe("correct");
  });

  it("공백·대소문자·문장부호 무시", () => {
    expect(compareAnswer("  말죽거리잔혹사  ", answer)).toBe("correct");
    expect(compareAnswer("말죽거리 잔혹사.", answer)).toBe("correct");
  });

  it("허용 표기(accept) 일치 → correct", () => {
    expect(compareAnswer("말죽거리잔혹사", answer)).toBe("correct");
  });

  it("부분 포함 → partial", () => {
    expect(compareAnswer("말죽거리", answer)).toBe("partial");
  });

  it("무관한 입력 → wrong", () => {
    expect(compareAnswer("친구", answer)).toBe("wrong");
  });

  it("빈 입력 → wrong", () => {
    expect(compareAnswer("   ", answer)).toBe("wrong");
  });
});
