import { backendUrl } from "../api/client";
import type { IdeophoneOption } from "../api/types";
import StimulusPlayer from "./StimulusPlayer";

type IdeophoneCardProps = {
  option: IdeophoneOption;
  mode?: "display" | "button";
  visible?: boolean;
  mediaVisible?: boolean;
  mediaPlaying?: boolean;
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
  mediaPlaying = false,
  autoplayToken,
  disabled = false,
  onEnded,
  onError,
  onSelect,
}: IdeophoneCardProps) {
  const optionLabel =
    option.romaji ?? option.kana ?? option.stimulusFile ?? `option ${option.ideophoneId}`;
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
          playing={mediaPlaying}
          onEnded={onEnded}
          onError={onError}
        />
      ) : null}

      {mode === "button" ? (
        <span className="card-meta">
          {[option.romaji, option.canonicalScript ?? option.modality]
            .filter(Boolean)
            .join(" - ")}
        </span>
      ) : null}
    </>
  );

  if (mode === "button") {
    return (
      <button
        aria-label={`Select ${optionLabel}`}
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
    return backendUrl(option.stimulusUrl);
  }

  if (!option.stimulusFile) {
    return undefined;
  }

  const stimulusPath = option.stimulusFile.startsWith("/stimuli/")
    ? option.stimulusFile
    : `/stimuli/${option.stimulusFile.replace(/^\/+/, "")}`;

  return backendUrl(stimulusPath);
}
