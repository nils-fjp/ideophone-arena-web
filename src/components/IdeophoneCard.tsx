import type { IdeophoneOption } from "../api/types";
import StimulusPlayer from "./StimulusPlayer";

type IdeophoneCardProps = {
  option: IdeophoneOption;
  mode?: "display" | "button";
  visible?: boolean;
  mediaVisible?: boolean;
  autoplayToken?: number;
  disabled?: boolean;
  onEnded?: () => void;
  onError?: (message: string) => void;
  onSelect?: (option: IdeophoneOption) => void;
};

export default function IdeophoneCard({
  option,
  mode = "display",
  visible = true,
  mediaVisible = false,
  autoplayToken,
  disabled = false,
  onEnded,
  onError,
  onSelect,
}: IdeophoneCardProps) {
  const className = [
    "ideophone-card",
    mode === "button" ? "choice-button" : "",
    visible ? "" : "empty",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {mediaVisible ? (
        <StimulusPlayer
          autoplayToken={autoplayToken}
          src={resolveStimulusSrc(option)}
          visible={mediaVisible}
          onEnded={onEnded}
          onError={onError}
        />
      ) : null}

      <span className="kana-text">{option.kana}</span>

      {mode === "button" ? (
        <span className="card-meta">
          {[option.romaji, option.gloss].filter(Boolean).join(" - ")}
        </span>
      ) : null}
    </>
  );

  if (mode === "button") {
    return (
      <button
        className={className}
        disabled={disabled || !visible}
        type="button"
        onClick={() => onSelect?.(option)}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{visible ? content : null}</div>;
}

function resolveStimulusSrc(option: IdeophoneOption) {
  if (option.stimulusUrl) {
    return option.stimulusUrl;
  }

  return option.stimulusFile ? `/stimuli/${option.stimulusFile}` : undefined;
}
