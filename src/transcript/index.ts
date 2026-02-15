/**
 * Transcript layer: single place for merging partials, cleaning text, confidence.
 * Consumes Deepgram events; outputs TranscriptState for the UI.
 */

export { createTranscriptManager, cleanTranscriptText } from "./manager";
export type { TranscriptManagerOptions, TranscriptManagerHandle } from "./manager";
