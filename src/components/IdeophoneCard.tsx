import type { ConditionPresentation } from "../conditionPresentation";
import { resolveStimulusSource } from "../stimulusMedia";
import type { IdeophoneOption } from "../api/types";
import StimulusDisplay from "./StimulusDisplay";
import StimulusPlayback from "./StimulusPlayback";

type IdeophoneCardProps = {
  meaning?: string;
  option: IdeophoneOption;
  presentation: ConditionPresentation;
  positionLabel: string;
  revealDetails?: boolean;
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
  meaning,
  option,
  presentation,
  positionLabel,
  revealDetails = false,
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
      <StimulusDisplay
        meaning={meaning}
        option={option}
        positionLabel={positionLabel}
        presentation={presentation}
        revealDetails={revealDetails}
      />

      {mediaVisible ? (
        <StimulusPlayback
          autoplayToken={autoplayToken}
          src={resolveStimulusSource(option)}
          playing={mediaPlaying}
          onEnded={onEnded}
          onError={onError}
        />
      ) : null}

      {mode === "button" && presentation.kind === "unknown" ? (
        <span className="card-meta">Presentation fallback</span>
      ) : null}
    </>
  );

  if (mode === "button") {
    return (
      <button
        aria-label={`Choose card ${positionLabel}: ${optionLabel}`}
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
