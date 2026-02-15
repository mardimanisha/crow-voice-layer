/**
 * MediaRecorder wrapper: stream audio chunks to a consumer via onChunk.
 * Used by the recording hook; Phase C (Deepgram) will consume the chunks.
 * No React; plain TypeScript.
 */

export interface RecorderOptions {
  /** MIME type for encoding. Defaults to browser-supported option. */
  mimeType?: string;
  /** Emit a chunk every N ms for streaming STT. Default 250. */
  timeslice?: number;
}

const DEFAULT_TIMESLICE_MS = 250;

/**
 * Create a recorder that feeds audio chunks to onChunk.
 * Call start() to begin, stop() to end. Caller must stop the MediaStream separately.
 */
export function createStreamRecorder(
  stream: MediaStream,
  onChunk: (chunk: Blob) => void,
  options: RecorderOptions = {}
): { start: () => void; stop: () => void } {
  const timeslice = options.timeslice ?? DEFAULT_TIMESLICE_MS;

  const mimeType =
    options.mimeType ??
    (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4");

  const recorder = new MediaRecorder(stream, { mimeType });

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      onChunk(event.data);
    }
  };

  return {
    start() {
      if (recorder.state === "inactive") {
        recorder.start(timeslice);
      }
    },
    stop() {
      if (recorder.state === "recording") {
        recorder.stop();
      }
    },
  };
}
