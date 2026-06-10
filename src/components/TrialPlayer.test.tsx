import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { RoundResponse } from "../api/types";
import TrialPlayer from "./TrialPlayer";

const roundMissingDisplayForm: RoundResponse = {
  sessionUuid: "session-1",
  roundId: 1,
  targetTranslation: "clattering, rattling",
  conditionName: "CONDITION_3_SOKUON",
  difficultyLevel: 1,
  left: {
    ideophoneId: 121,
    kana: "ごそごそ",
    canonicalForm: "ごそごそ",
    romaji: "gosogoso",
  },
  right: {
    ideophoneId: 122,
    kana: "かたかた",
    displayForm: "かたかた",
    canonicalForm: "カタカタ",
    romaji: "katakata",
  },
};

describe("TrialPlayer round validation wiring", () => {
  it("shows the round-problem panel instead of guessing a display form", () => {
    const markup = renderToStaticMarkup(
      <TrialPlayer
        round={roundMissingDisplayForm}
        sessionStats={{ answered: 0, correct: 0 }}
        sessionUuid="session-1"
        totalRounds={30}
        onAnswered={() => {}}
        onAuthExpired={() => {}}
        onBackToStart={() => {}}
        onNeedNextRound={() => {}}
      />,
    );

    expect(markup).toContain("Round unavailable");
    expect(markup).toContain("displayForm");
    expect(markup).not.toContain("script-display-text");
  });
});
