/**
 * Voice panel and pipeline contract types.
 * Phase B (Audio) will drive recording state; Phase C–D (Deepgram + transcript manager)
 * will push transcript/confidence; Phase E (Crow adapter) will provide send.
 */

/** Callback for consuming audio chunks (Phase B → Phase C Deepgram). */
export type AudioChunkCallback = (chunk: Blob) => void;

/** Recording state: mic on/off and optional permission or capture error */
export interface RecordingState {
  isRecording: boolean;
  error?: string;
}

/** Transcript display: current text and optional confidence (0–1) for progress */
export interface TranscriptState {
  transcript: string;
  confidence?: number;
}

/** Send to Crow: callback and availability (Phase E will use adapter.isAvailable()) */
export interface SendToCrowState {
  onSend: (text: string) => void;
  isSendAvailable: boolean;
}
