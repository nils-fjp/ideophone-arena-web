import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { IdeophoneOption } from "../api/types";
import { getConditionPresentation } from "../conditionPresentation";
import StimulusDisplay from "./StimulusDisplay";

// Mirrors backend seed rows where displayForm cannot be derived from kana by
// per-character conversion (long-vowel ー normalization), the case the deleted
// heuristics inverted.
const mismatchOption: IdeophoneOption = {
  ideophoneId: 125,
  kana: "じゃあじゃあ",
  displayForm: "ジャージャー",
  canonicalForm: "じゃーじゃー",
  romaji: "zyaazyaa",
  canonicalScript: "HK",
};

const matchOption: IdeophoneOption = {
  ideophoneId: 62,
  kana: "かたかた",
  displayForm: "カタカタ",
  canonicalForm: "カタカタ",
  romaji: "katakata",
  canonicalScript: "KK",
};

function render(
  option: IdeophoneOption,
  conditionName: string,
  revealDetails = false,
  meaning?: string,
) {
  return renderToStaticMarkup(
    <StimulusDisplay
      meaning={meaning}
      option={option}
      positionLabel="A"
      presentation={getConditionPresentation(conditionName)}
      revealDetails={revealDetails}
    />,
  );
}

describe("StimulusDisplay pre-answer rendering", () => {
  it("script-match renders the backend displayForm verbatim", () => {
    const markup = render(matchOption, "CONDITION_2_SOKUON");
    expect(markup).toContain('<span class="script-display-text">カタカタ</span>');
  });

  it("script-mismatch renders the backend displayForm verbatim, not a kana conversion", () => {
    const markup = render(mismatchOption, "CONDITION_3_SOKUON");
    expect(markup).toContain('<span class="script-display-text">ジャージャー</span>');
    expect(markup).not.toContain("ジャアジャア");
    expect(markup).not.toContain("じゃあじゃあ");
  });

  it("audio-only renders the neutral placeholder without script or romaji", () => {
    const markup = render(matchOption, "CONDITION_1_SOKUON");
    expect(markup).toContain("placeholder-display");
    expect(markup).toContain(">A<");
    expect(markup).not.toContain(matchOption.displayForm as string);
    expect(markup).not.toContain(matchOption.canonicalForm as string);
    expect(markup).not.toContain(matchOption.romaji as string);
  });
});

describe("StimulusDisplay feedback reveal", () => {
  it("renders canonicalForm, romaji, and meaning", () => {
    const markup = render(mismatchOption, "CONDITION_3_SOKUON", true, "noisily gushing");
    expect(markup).toContain('<span class="script-display-text">じゃーじゃー</span>');
    expect(markup).toContain('<span class="romaji-display-text">zyaazyaa</span>');
    expect(markup).toContain('<span class="meaning-display-text">noisily gushing</span>');
  });

  it("reveals canonicalForm in the audio-only condition too", () => {
    const markup = render(matchOption, "CONDITION_1_SOKUON", true, "clattering, rattling");
    expect(markup).toContain('<span class="script-display-text">カタカタ</span>');
    expect(markup).toContain('<span class="romaji-display-text">katakata</span>');
  });
});
