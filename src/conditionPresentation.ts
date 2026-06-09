import type { ConditionName, IdeophoneOption } from "./api/types";

export type PresentationKind =
  | "audio-only"
  | "script-match"
  | "script-mismatch"
  | "unknown";

type ScriptFamily = "hiragana" | "katakana" | "unknown";

export type ConditionPresentation = {
  kind: PresentationKind;
  label: string;
  description: string;
};

export type ScriptLabConditionOption = {
  conditionName: ConditionName;
  label: string;
  explanation: string;
};

export const SCRIPT_LAB_CONDITION_OPTIONS: ScriptLabConditionOption[] = [
  {
    conditionName: "CONDITION_1_SOKUON",
    label: "Audio only",
    explanation: "Focus on sound, no script cue.",
  },
  {
    conditionName: "CONDITION_2_SOKUON",
    label: "Script match",
    explanation: "Visible script follows the ideophone's canonical script.",
  },
  {
    conditionName: "CONDITION_3_SOKUON",
    label: "Script mismatch",
    explanation: "Visible script intentionally conflicts with the canonical script.",
  },
];

export function getConditionPresentation(
  conditionName: ConditionName | string | undefined,
): ConditionPresentation {
  switch (conditionName) {
    case "CONDITION_1_SOKUON":
      return {
        kind: "audio-only",
        label: "Audio only",
        description: "Focus on sound, no script cue.",
      };
    case "CONDITION_2_SOKUON":
      return {
        kind: "script-match",
        label: "Script match",
        description: "Visible script follows the ideophone's canonical script.",
      };
    case "CONDITION_3_SOKUON":
      return {
        kind: "script-mismatch",
        label: "Script mismatch",
        description: "Visible script intentionally conflicts with the canonical script.",
      };
    default:
      return {
        kind: "unknown",
        label: "Unknown presentation",
        description: "React falls back to a neutral placeholder for unsupported conditions.",
      };
  }
}

export function getPreAnswerDisplayForm(
  option: IdeophoneOption,
  presentation: ConditionPresentation,
) {
  if (presentation.kind === "script-mismatch") {
    return getOppositeDisplayForm(option);
  }

  return getCanonicalDisplayForm(option);
}

export function getCanonicalDisplayForm(option: IdeophoneOption) {
  const canonical = option.canonicalScript?.trim();
  if (canonical && containsKana(canonical)) {
    return canonical;
  }

  const baseText = option.kana?.trim() || option.romaji?.trim();
  if (!baseText) {
    return `Option ${option.ideophoneId}`;
  }

  const scriptFamily = getCanonicalScriptFamily(option);
  if (scriptFamily === "katakana") {
    return toKatakana(baseText);
  }
  if (scriptFamily === "hiragana") {
    return toHiragana(baseText);
  }

  return baseText;
}

export function getOppositeDisplayForm(option: IdeophoneOption) {
  const canonical = getCanonicalDisplayForm(option);
  const scriptFamily = getCanonicalScriptFamily(option);

  if (scriptFamily === "hiragana") {
    return toKatakana(canonical);
  }
  if (scriptFamily === "katakana") {
    return toHiragana(canonical);
  }

  const detectedFamily = detectKanaFamily(canonical);
  if (detectedFamily === "hiragana") {
    return toKatakana(canonical);
  }
  if (detectedFamily === "katakana") {
    return toHiragana(canonical);
  }

  return canonical;
}

function getCanonicalScriptFamily(option: IdeophoneOption): ScriptFamily {
  const canonical = option.canonicalScript?.trim().toUpperCase();

  if (canonical === "HU" || canonical === "HIRAGANA") {
    return "hiragana";
  }
  if (canonical === "KD" || canonical === "KATAKANA") {
    return "katakana";
  }

  const canonicalFamily = detectKanaFamily(option.canonicalScript);
  if (canonicalFamily !== "unknown") {
    return canonicalFamily;
  }

  return detectKanaFamily(option.kana);
}

function detectKanaFamily(value?: string): ScriptFamily {
  if (!value) {
    return "unknown";
  }

  let hiraganaCount = 0;
  let katakanaCount = 0;

  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (!codePoint) {
      continue;
    }

    if (codePoint >= 0x3041 && codePoint <= 0x3096) {
      hiraganaCount += 1;
    }
    if (codePoint >= 0x30a1 && codePoint <= 0x30f6) {
      katakanaCount += 1;
    }
  }

  if (hiraganaCount > katakanaCount) {
    return "hiragana";
  }
  if (katakanaCount > hiraganaCount) {
    return "katakana";
  }

  return "unknown";
}

function containsKana(value: string) {
  return detectKanaFamily(value) !== "unknown";
}

function toKatakana(value: string) {
  return convertKana(value, 0x3041, 0x3096, 0x60);
}

function toHiragana(value: string) {
  return convertKana(value, 0x30a1, 0x30f6, -0x60);
}

function convertKana(value: string, start: number, end: number, offset: number) {
  return [...value]
    .map((character) => {
      const codePoint = character.codePointAt(0);
      if (!codePoint || codePoint < start || codePoint > end) {
        return character;
      }

      return String.fromCodePoint(codePoint + offset);
    })
    .join("");
}
