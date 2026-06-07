import type { AnswerResultResponse } from "../api/types";
import type { SessionStats } from "../App";

type FeedbackPanelProps = {
  result: AnswerResultResponse;
  sessionStats: SessionStats;
};

export default function FeedbackPanel({
  result,
  sessionStats,
}: FeedbackPanelProps) {
  const sessionAccuracy =
    sessionStats.answered > 0
      ? Math.round((sessionStats.correct / sessionStats.answered) * 100)
      : 0;
  const accountAccuracy =
    result.totalAnswered > 0
      ? Math.round((result.totalCorrect / result.totalAnswered) * 100)
      : 0;

  return (
    <section
      className={result.correct ? "feedback correct" : "feedback incorrect"}
      aria-live="polite"
    >
      <h2>{result.correct ? "Correct" : "Incorrect"}</h2>

      <dl className="feedback-grid">
        {result.selectedKana ? (
          <>
            <dt>Selected</dt>
            <dd>{result.selectedKana}</dd>
          </>
        ) : null}

        {result.correctKana ? (
          <>
            <dt>Correct</dt>
            <dd>{result.correctKana}</dd>
          </>
        ) : null}

        <dt>Session score</dt>
        <dd>
          {sessionStats.correct} / {sessionStats.answered} ({sessionAccuracy}%)
        </dd>

        <dt>Account total</dt>
        <dd>
          {result.totalCorrect} / {result.totalAnswered} ({accountAccuracy}%)
        </dd>
      </dl>

      <p className="notice-text">Next trial starts automatically.</p>
    </section>
  );
}
