import { useEffect, useRef, useState } from "react";
import { ApiError, submitAnswer } from "../api/client";
import type {
  AnswerResultResponse,
  IdeophoneOption,
  RoundResponse,
  TrialPhase,
} from "../api/types";
import FeedbackPanel from "./FeedbackPanel";
import IdeophoneCard from "./IdeophoneCard";

type TrialPlayerProps = {
  sessionUuid: string;
  round: RoundResponse;
  onNeedNextRound: () => void;
  onAnswered: () => void;
  onAuthExpired: (message: string) => void;
};

export default function TrialPlayer({
  sessionUuid,
  round,
  onNeedNextRound,
  onAnswered,
  onAuthExpired,
}: TrialPlayerProps) {
  const [phase, setPhase] = useState<TrialPhase>("fixation");
  const [answerResult, setAnswerResult] =
    useState<AnswerResultResponse | null>(null);
  const [playbackMessage, setPlaybackMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const choiceStartedAtRef = useRef<number | null>(null);
  const roundTokenRef = useRef(0);

  useEffect(() => {
    const token = roundTokenRef.current + 1;
    roundTokenRef.current = token;

    const delay = round.timing?.fixationMs ?? 800;
    const timerId = window.setTimeout(() => {
      if (roundTokenRef.current === token) {
        setPhase("left-playing");
      }
    }, delay);

    return () => window.clearTimeout(timerId);
  }, [round.roundId, round.timing?.fixationMs]);

  function handleLeftEnded() {
    setPhase((current) =>
      current === "left-playing" ? "right-playing" : current,
    );
  }

  function handleRightEnded() {
    const preChoiceDelayMs = round.timing?.preChoiceDelayMs ?? 0;

    window.setTimeout(() => {
      choiceStartedAtRef.current = performance.now();
      setPhase((current) => (current === "right-playing" ? "choice" : current));
    }, preChoiceDelayMs);
  }

  async function handleSelect(option: IdeophoneOption) {
    if (phase !== "choice") {
      return;
    }

    const startedAt = choiceStartedAtRef.current ?? performance.now();
    const responseTimeMs = Math.round(performance.now() - startedAt);
    setPhase("submitting");
    setSubmitError("");

    try {
      const result = await submitAnswer(sessionUuid, {
        roundId: round.roundId,
        selectedIdeophoneId: option.ideophoneId,
        responseTimeMs,
      });
      setAnswerResult(result);
      setPhase("feedback");
      onAnswered();
    } catch (caught) {
      if (caught instanceof ApiError && [401, 403].includes(caught.status)) {
        onAuthExpired(caught.message);
        return;
      }

      setSubmitError(
        caught instanceof Error ? caught.message : "Answer submission failed",
      );
      setPhase("choice");
    }
  }

  function handlePlaybackError(message: string) {
    setPlaybackMessage(message);
  }

  if (phase === "fixation") {
    return (
      <section className="trial-stage fixation-stage" aria-live="polite">
        <span className="fixation-cross">+</span>
      </section>
    );
  }

  if (phase === "feedback" && answerResult) {
    return <FeedbackPanel result={answerResult} onNext={onNeedNextRound} />;
  }

  const isLeftPlaying = phase === "left-playing";
  const isRightPlaying = phase === "right-playing";
  const isChoice = phase === "choice" || phase === "submitting";

  return (
    <section className="trial-stage" aria-live="polite">
      <div className="trial-copy">
        <p>Listen to these two Japanese words.</p>
        <p className="small-copy">Click to choose after both have played.</p>
      </div>

      <div className="stimulus-row" aria-label="Ideophone stimuli">
        <IdeophoneCard
          autoplayToken={round.roundId * 10 + 1}
          mediaVisible={isLeftPlaying}
          option={round.left}
          visible={isLeftPlaying || isChoice}
          onEnded={handleLeftEnded}
          onError={handlePlaybackError}
        />

        <IdeophoneCard
          autoplayToken={round.roundId * 10 + 2}
          mediaVisible={isRightPlaying}
          option={round.right}
          visible={isRightPlaying || isChoice}
          onEnded={handleRightEnded}
          onError={handlePlaybackError}
        />
      </div>

      <div className="translation-lines">
        <p>
          One of them means{" "}
          <strong>{round.translations?.target ?? round.prompt}</strong>
        </p>
        {round.translations?.other ? (
          <p>
            The other means <strong>{round.translations.other}</strong>
          </p>
        ) : null}
      </div>

      {playbackMessage ? (
        <p className="notice-text">
          Stimulus playback issue: {playbackMessage}
        </p>
      ) : null}

      {isChoice ? (
        <div className="choice-area">
          <p className="question-text">
            Which one do you think means
            <br />
            <strong>{round.translations?.target ?? round.prompt}?</strong>
          </p>
          <p className="small-copy">Click one to select:</p>

          <div className="choice-grid">
            <IdeophoneCard
              disabled={phase === "submitting"}
              mode="button"
              option={round.left}
              onSelect={handleSelect}
            />
            <IdeophoneCard
              disabled={phase === "submitting"}
              mode="button"
              option={round.right}
              onSelect={handleSelect}
            />
          </div>
        </div>
      ) : null}

      {phase === "submitting" ? <p className="notice-text">Submitting...</p> : null}
      {submitError ? <p className="error-text centered">{submitError}</p> : null}
    </section>
  );
}
