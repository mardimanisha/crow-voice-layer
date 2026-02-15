/**
 * Audio layer: microphone access and stream recorder.
 * Public API for use by hooks; no Deepgram or transcript dependency.
 */

export {
  getMicrophoneStream,
  stopMicrophoneStream,
  toMicrophoneError,
  type MicrophoneError,
  type MicrophoneErrorCode,
} from "./microphone";

export {
  createStreamRecorder,
  type RecorderOptions,
} from "./recorder";
