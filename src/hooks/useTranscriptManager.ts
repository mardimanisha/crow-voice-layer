"use client";

import { useRef, useCallback } from "react";
import { useTranscriptState } from "@/hooks/useTranscriptState";
import { createTranscriptManager } from "@/transcript";
import type { DeepgramTranscriptResult } from "@/deepgram";
import type { TranscriptManagerHandle } from "@/transcript";

/**
 * Composes useTranscriptState with the transcript manager. Use in VoicePanel:
 * pass handleResult to useVoicePipeline's onTranscript, and call reset() when
 * recording starts so each session begins with a clean transcript.
 */
export function useTranscriptManager() {
  const { transcript, setTranscript, confidence, setConfidence } =
    useTranscriptState();

  const managerRef = useRef<TranscriptManagerHandle | null>(null);
  if (!managerRef.current) {
    managerRef.current = createTranscriptManager({
      onUpdate: ({ transcript: t, confidence: c }) => {
        setTranscript(t);
        setConfidence(c);
      },
    });
  }

  const handleResult = useCallback((result: DeepgramTranscriptResult) => {
    managerRef.current?.handleResult(result);
  }, []);

  const reset = useCallback(() => {
    managerRef.current?.reset();
  }, []);

  return {
    transcript,
    setTranscript,
    confidence,
    setConfidence,
    handleResult,
    reset,
  };
}
