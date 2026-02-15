"use client";

import { useState, useCallback } from "react";

/**
 * Transcript and confidence state. Phase C–D (Deepgram + transcript manager)
 * will push updates here; for Phase A we only hold local editable state.
 */
export function useTranscriptState() {
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState<number | undefined>(undefined);

  return {
    transcript,
    setTranscript,
    confidence,
    setConfidence,
  };
}
