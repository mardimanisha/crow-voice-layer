/**
 * Transcript manager: processing layer between STT (Deepgram) and UI.
 * Merges partials, cleans text, handles confidence, produces TranscriptState.
 *
 * Contract:
 * - Input: DeepgramTranscriptResult events from the Deepgram client.
 * - Output: TranscriptState (transcript + optional confidence) via onUpdate callback.
 */

import type { DeepgramTranscriptResult } from "@/deepgram";
import type { TranscriptState } from "@/types/voice";

/** Trim and collapse runs of spaces/newlines to a single space. */
export function cleanTranscriptText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export interface TranscriptManagerOptions {
  onUpdate: (state: TranscriptState) => void;
}

export interface TranscriptManagerHandle {
  handleResult: (result: DeepgramTranscriptResult) => void;
  reset: () => void;
}

/**
 * Create a stateful transcript manager. Pass handleResult to the pipeline's onTranscript;
 * call reset() when starting a new recording session.
 */
export function createTranscriptManager(
  options: TranscriptManagerOptions
): TranscriptManagerHandle {
  const { onUpdate } = options;
  let committed = "";
  let interim = "";
  let confidence: number | undefined;
  let lastEmittedTranscript = "";
  let lastEmittedConfidence: number | undefined;

  function emit() {
    const transcript = [committed, interim].filter(Boolean).join(" ").trim();
    const confidenceChanged =
      confidence !== lastEmittedConfidence &&
      (confidence !== undefined || lastEmittedConfidence !== undefined);
    const transcriptChanged = transcript !== lastEmittedTranscript;
    // Do not overwrite non-empty transcript with empty (e.g. silence/finalize-only events).
    if (transcript === "" && lastEmittedTranscript !== "") return;
    if (!transcriptChanged && !confidenceChanged) return;
    lastEmittedTranscript = transcript;
    lastEmittedConfidence = confidence;
    onUpdate({ transcript, confidence });
  }

  return {
    handleResult(result: DeepgramTranscriptResult) {
      const cleaned = cleanTranscriptText(result.transcript);
      confidence = result.confidence;

      if (result.is_final || result.speech_final) {
        if (cleaned) {
          committed = committed ? `${committed} ${cleaned}` : cleaned;
        }
        interim = "";
      } else {
        interim = cleaned;
      }
      emit();
    },
    reset() {
      committed = "";
      interim = "";
      confidence = undefined;
      lastEmittedTranscript = "";
      lastEmittedConfidence = undefined;
      onUpdate({ transcript: "", confidence: undefined });
    },
  };
}
