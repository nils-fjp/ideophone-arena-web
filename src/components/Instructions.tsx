type InstructionsProps = {
  isStarting: boolean;
  error?: string;
  onStart: () => void;
};

export default function Instructions({
  isStarting,
  error,
  onStart,
}: InstructionsProps) {
  return (
    <section className="instructions" aria-labelledby="instructions-title">
      <h1 id="instructions-title">Choosing Task Instructions</h1>

      <p>
        In this task, you will see two Japanese ideophones and their English
        meanings. Your task is to match one translation with the Japanese word
        you think best fits that meaning.
      </p>

      <p>
        First, two words will play automatically and appear one at a time.
        Watch or listen to both before making your choice.
      </p>

      <p>
        Then, read the translations and decide which word best matches the
        highlighted target meaning.
      </p>

      <p>
        Click one Japanese word below to submit your answer. Feedback appears
        immediately after the backend records the response.
      </p>

      {error ? <p className="error-text centered">{error}</p> : null}

      <button
        className="primary-button"
        disabled={isStarting}
        type="button"
        onClick={onStart}
      >
        {isStarting ? "Starting..." : "Start Game"}
      </button>
    </section>
  );
}
