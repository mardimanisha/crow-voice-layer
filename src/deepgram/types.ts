/**
 * Deepgram streaming STT types.
 * Documented so the transcript manager (Phase D) can rely on a stable contract.
 *
 * WebSocket API shape (from Deepgram listen-streaming):
 * - type "Results" = transcription message
 * - is_final: false = interim, true = final result for this segment
 * - speech_final: end of natural speech segment (endpointing)
 * - channel.alternatives[0].transcript, .confidence
 */

/** Minimal transcript result passed to onTranscript for the transcript manager. */
export interface DeepgramTranscriptResult {
  /** Transcript text (channel.alternatives[0].transcript). */
  transcript: string;
  /** 0–1 confidence (channel.alternatives[0].confidence). */
  confidence: number;
  /** false = interim; true = final result for this segment. */
  is_final: boolean;
  /** End of natural speech segment; endpointing. */
  speech_final: boolean;
}

/** Error codes for onError; maps architecture error handling (network drop, STT failure). */
export type DeepgramErrorCode =
  | "network"
  | "auth"
  | "server"
  | "unknown";

export interface DeepgramClientError {
  code: DeepgramErrorCode;
  message: string;
}

/** Options for createDeepgramClient. */
export interface DeepgramClientOptions {
  /** API key. When provided, the SDK uses Token auth. Omit when using accessToken. */
  apiKey?: string;
  /** Short-lived JWT from token endpoint. When provided, the SDK uses Bearer auth (required for /v1/auth/grant tokens). */
  accessToken?: string;
  /** Called for each transcript event (partial and final). */
  onTranscript: (result: DeepgramTranscriptResult) => void;
  /** Called on connection open. */
  onOpen?: () => void;
  /** Called when connection closes. */
  onClose?: () => void;
  /** Called on error; reconnect may be attempted for network errors. */
  onError?: (err: DeepgramClientError) => void;
  /** Model. Default "nova-2" or per docs. */
  model?: string;
  /** Language hint (BCP-47). Default "en-US". */
  language?: string;
  /** Smart formatting. Default true. */
  smart_format?: boolean;
  /** Interim results (ongoing updates). Default true for live UI. */
  interim_results?: boolean;
  /** Seconds without audio before sending KeepAlive. Default 8. */
  keepAliveThresholdSeconds?: number;
  /** Max reconnect attempts with backoff. Default 3. */
  maxReconnectAttempts?: number;
}

/** Handle returned by startListening(); send chunks and call stop when done. */
export interface DeepgramListeningHandle {
  /** Send an audio chunk (Blob from recorder). Call when recorder emits chunk. */
  send: (chunk: Blob) => void;
  /** Close connection and stop KeepAlive. Call when user stops mic. */
  stop: () => void;
}
