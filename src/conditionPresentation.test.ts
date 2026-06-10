import { describe, expect, it } from "vitest";
import { getConditionPresentation } from "./conditionPresentation";

describe("getConditionPresentation", () => {
  it("maps CONDITION_1_SOKUON to audio-only", () => {
    expect(getConditionPresentation("CONDITION_1_SOKUON").kind).toBe("audio-only");
  });

  it("maps CONDITION_2_SOKUON to script-match", () => {
    expect(getConditionPresentation("CONDITION_2_SOKUON").kind).toBe("script-match");
  });

  it("maps CONDITION_3_SOKUON to script-mismatch", () => {
    expect(getConditionPresentation("CONDITION_3_SOKUON").kind).toBe("script-mismatch");
  });

  it("falls back to unknown for unsupported conditions", () => {
    expect(getConditionPresentation("TEXT_ONLY").kind).toBe("unknown");
    expect(getConditionPresentation(undefined).kind).toBe("unknown");
  });
});
