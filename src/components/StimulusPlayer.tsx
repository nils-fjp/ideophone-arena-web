import { useEffect, useMemo, useRef, useState } from "react";

const FALLBACK_DURATION_MS = 1200;

type StimulusPlayerProps = {
  src?: string;
  visible: boolean;
  autoplayToken?: number;
  onEnded?: () => void;
  onError?: (message: string) => void;
};

export default function StimulusPlayer({
  src,
  visible,
  autoplayToken,
  onEnded,
  onError,
}: StimulusPlayerProps) {
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
  const finishedRef = useRef(false);
  const [blockedMessage, setBlockedMessage] = useState("");
  const isVideo = useMemo(() => /\.(mp4|webm|ogg)$/i.test(src ?? ""), [src]);

  useEffect(() => {
    finishedRef.current = false;
    setBlockedMessage("");

    if (!visible || autoplayToken === undefined) {
      return undefined;
    }

    let fallbackId: number | undefined;

    function finish() {
      if (finishedRef.current) {
        return;
      }
      finishedRef.current = true;
      if (fallbackId !== undefined) {
        window.clearTimeout(fallbackId);
      }
      onEnded?.();
    }

    function scheduleFallback(message: string) {
      console.error(message, { src });
      onError?.(message);
      fallbackId = window.setTimeout(finish, FALLBACK_DURATION_MS);
    }

    if (!src) {
      scheduleFallback("No stimulus source was provided");
      return () => window.clearTimeout(fallbackId);
    }

    const media = mediaRef.current;
    if (!media) {
      fallbackId = window.setTimeout(finish, FALLBACK_DURATION_MS);
      return () => window.clearTimeout(fallbackId);
    }

    function handleMediaError() {
      scheduleFallback("Stimulus media failed to load");
    }

    media.addEventListener("ended", finish);
    media.addEventListener("error", handleMediaError);
    media.currentTime = 0;
    const playPromise = media.play();

    if (playPromise !== undefined) {
      playPromise.catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Stimulus playback failed";
        console.error("Stimulus playback failed", { src, error });
        onError?.(message);
        setBlockedMessage(message);
      });
    }

    return () => {
      if (fallbackId !== undefined) {
        window.clearTimeout(fallbackId);
      }
      media.removeEventListener("ended", finish);
      media.removeEventListener("error", handleMediaError);
      media.pause();
    };
  }, [autoplayToken, onEnded, onError, src, visible]);

  async function handleManualPlay() {
    const media = mediaRef.current;
    if (!media) {
      return;
    }

    setBlockedMessage("");
    try {
      media.currentTime = 0;
      await media.play();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Stimulus playback failed";
      setBlockedMessage(message);
      onError?.(message);
    }
  }

  if (!src) {
    return null;
  }

  const fallbackButton = blockedMessage ? (
    <button className="media-play-button" type="button" onClick={handleManualPlay}>
      Play
    </button>
  ) : null;

  if (isVideo) {
    return (
      <>
        <video
          ref={(node) => {
            mediaRef.current = node;
          }}
          className="stimulus-media"
          playsInline
          preload="auto"
          src={src}
        />
        {fallbackButton}
      </>
    );
  }

  return (
    <>
      <audio
        ref={(node) => {
          mediaRef.current = node;
        }}
        preload="auto"
        src={src}
      />
      {fallbackButton}
    </>
  );
}
