import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { IdeophoneOption } from "../api/types";
import { getConditionPresentation } from "../conditionPresentation";
import IdeophoneCard from "./IdeophoneCard";

const option: IdeophoneOption = {
  ideophoneId: 62,
  kana: "かたかた",
  displayForm: "カタカタ",
  canonicalForm: "カタカタ",
  romaji: "katakata",
  canonicalScript: "KK",
};

describe("IdeophoneCard choice accessibility", () => {
  // Invariant 7: during choice the accessibility tree must identify the card
  // by position only — no kana, romaji, or meaning before feedback.
  it("uses a position-only aria-label in button mode", () => {
    const markup = renderToStaticMarkup(
      <IdeophoneCard
        mode="button"
        option={option}
        positionLabel="A"
        presentation={getConditionPresentation("CONDITION_1_SOKUON")}
      />,
    );

    const labels = [...markup.matchAll(/aria-label="([^"]*)"/g)].map(
      (match) => match[1],
    );
    expect(labels).toContain("Choose card A");
    for (const label of labels) {
      expect(label).not.toMatch(/katakata|かたかた|カタカタ/);
    }
  });

  it("keeps the card content mounted while hidden so the slot reserves space", () => {
    const markup = renderToStaticMarkup(
      <IdeophoneCard
        option={option}
        positionLabel="B"
        presentation={getConditionPresentation("CONDITION_1_SOKUON")}
        visible={false}
      />,
    );

    expect(markup).toContain("ideophone-card");
    expect(markup).toContain("empty");
    expect(markup).toContain("placeholder-display");
  });
});
