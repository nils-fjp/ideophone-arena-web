import type { AnswerResultResponse } from "../api/types";

type FeedbackPanelProps = {
  result: AnswerResultResponse;
  onNext: () => void;
};

export default function FeedbackPanel({ result, onNext }: FeedbackPanelProps) {
  const accuracy =
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

        <dt>Score</dt>
        <dd>
          {result.totalCorrect} / {result.totalAnswered} ({accuracy}%)
        </dd>
      </dl>

      <button className="primary-button" type="button" onClick={onNext}>
        Next
      </button>
    </section>
  );
}
