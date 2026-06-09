import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const tempDir = await mkdtemp(join(tmpdir(), "ideophone-presentation-"));

try {
  await execFileAsync(
    "node_modules/.bin/tsc",
    [
      "src/conditionPresentation.ts",
      "--ignoreConfig",
      "--target",
      "ES2023",
      "--module",
      "ES2022",
      "--moduleResolution",
      "bundler",
      "--skipLibCheck",
      "--outDir",
      tempDir,
      "--noEmit",
      "false",
      "--declaration",
      "false",
    ],
    { cwd: process.cwd() },
  );

  const presentation = await import(
    `file://${join(tempDir, "conditionPresentation.js")}`
  );

  const hiraganaOption = {
    ideophoneId: 1,
    kana: "ごそごそ",
    romaji: "gosogoso",
    canonicalScript: "HU",
  };
  const katakanaOption = {
    ideophoneId: 2,
    kana: "かたかた",
    romaji: "katakata",
    canonicalScript: "KD",
  };

  assertEqual(
    presentation.getCanonicalDisplayForm(hiraganaOption),
    "ごそごそ",
    "HU canonical display should remain hiragana",
  );
  assertEqual(
    presentation.getCanonicalDisplayForm(katakanaOption),
    "カタカタ",
    "KD canonical display should render katakana",
  );
  assertEqual(
    presentation.getOppositeDisplayForm(hiraganaOption),
    "ゴソゴソ",
    "HU mismatch display should render katakana",
  );
  assertEqual(
    presentation.getOppositeDisplayForm(katakanaOption),
    "かたかた",
    "KD mismatch display should render hiragana",
  );
  assertEqual(
    presentation.getConditionPresentation("CONDITION_1_SOKUON").kind,
    "audio-only",
    "condition 1 should map to audio-only",
  );
  assertEqual(
    presentation.getConditionPresentation("CONDITION_2_SOKUON").kind,
    "script-match",
    "condition 2 should map to script-match",
  );
  assertEqual(
    presentation.getConditionPresentation("CONDITION_3_SOKUON").kind,
    "script-mismatch",
    "condition 3 should map to script-mismatch",
  );
  assertEqual(
    presentation.getConditionPresentation("UNKNOWN").kind,
    "unknown",
    "unknown conditions should fall back safely",
  );

  console.log("Presentation logic verified.");
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${expected}, received ${actual}`);
  }
}
