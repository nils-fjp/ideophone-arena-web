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
  const className = [
    "ideophone-card",
    mode === "button" ? "choice-button" : "",
    visible ? "" : "empty",
  ]
    .filter(Boolean)
    .join(" ");

  // The card and its display content stay mounted in every phase so the slot
  // keeps its reserved size; `empty` toggles visibility only. The media
  // element still mounts per-phase to preserve autoplay behavior — it renders
  // no visible box, so the reserved space is unaffected.
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
    </>
  );

  if (mode === "button") {
    // Position-only label until feedback: the choice must not reveal romaji,
    // kana, or meaning through the accessibility tree (invariant 7).
    return (
      <button
        aria-label={`Choose card ${positionLabel}`}
        className={className}
        disabled={disabled || !visible}
        type="button"
        onClick={() => onSelect?.(option)}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
