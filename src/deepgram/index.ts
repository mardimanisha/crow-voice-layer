/**
 * Deepgram streaming STT layer.
 * Public API for Phase C: client and types for transcript manager (Phase D).
 */

export { createDeepgramClient } from "./client";
export type {
  DeepgramTranscriptResult,
  DeepgramClientError,
  DeepgramErrorCode,
  DeepgramClientOptions,
  DeepgramListeningHandle,
} from "./types";
