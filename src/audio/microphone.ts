/**
 * Microphone access: request permission, get MediaStream, and cleanup.
 * Used by the recording hook; no dependency on Deepgram or transcript.
 */

export type MicrophoneErrorCode =
  | "permission_denied"
  | "not_found"
  | "not_allowed"
  | "other";

export interface MicrophoneError {
  code: MicrophoneErrorCode;
  message: string;
}

function isDOMException(e: unknown): e is DOMException {
  return e instanceof DOMException;
}

/**
 * Maps browser permission/device errors to a user-facing message and code.
 */
export function toMicrophoneError(error: unknown): MicrophoneError {
  if (isDOMException(error)) {
    switch (error.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
        return {
          code: "permission_denied",
          message: "Microphone access denied",
        };
      case "NotFoundError":
        return {
          code: "not_found",
          message: "No microphone found",
        };
      case "NotReadableError":
      case "AbortError":
        return {
          code: "other",
          message: "Microphone could not be used. Try another device or tab.",
        };
      default:
        return {
          code: "other",
          message: error.message || "Microphone error",
        };
    }
  }
  if (error instanceof Error) {
    return { code: "other", message: error.message };
  }
  return { code: "other", message: "Microphone error" };
}

/**
 * Request microphone access and return the MediaStream.
 * Caller must call stopMicrophoneStream(stream) when done to release the device.
 *
 * @throws never; rejects with MicrophoneError on failure
 */
export function getMicrophoneStream(): Promise<MediaStream> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return Promise.reject({
      code: "other" as MicrophoneErrorCode,
      message: "Microphone is not supported in this environment",
    } satisfies MicrophoneError);
  }

  return navigator.mediaDevices
    .getUserMedia({ audio: true })
    .catch((err) => Promise.reject(toMicrophoneError(err)));
}

/**
 * Stop all tracks on the given stream to release the microphone.
 * Safe to call multiple times or with an already-inactive stream.
 */
export function stopMicrophoneStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}
