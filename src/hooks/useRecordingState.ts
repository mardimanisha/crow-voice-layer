"use client";

import { useState, useCallback, useRef } from "react";
import {
  getMicrophoneStream,
  stopMicrophoneStream,
  toMicrophoneError,
  createStreamRecorder,
} from "@/audio";
import type { AudioChunkCallback } from "@/types/voice";

export interface UseRecordingStateOptions {
  /** Called with each audio chunk while recording. Phase C (Deepgram) will use this. */
  onChunk?: AudioChunkCallback;
}

/**
 * Recording state for the voice panel. Phase B: real mic permission and
 * start/stop via audio layer; optional onChunk for Phase C (Deepgram).
 */
export function useRecordingState(options: UseRecordingStateOptions = {}) {
  const { onChunk } = options;
  const [isRecording, setIsRecording] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<ReturnType<typeof createStreamRecorder> | null>(
    null
  );
  const onChunkRef = useRef(onChunk);
  onChunkRef.current = onChunk;

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      recorderRef.current?.stop();
      recorderRef.current = null;
      if (streamRef.current) {
        stopMicrophoneStream(streamRef.current);
        streamRef.current = null;
      }
      setIsRecording(false);
      setError(undefined);
      return;
    }

    setError(undefined);
    setIsRequestingPermission(true);
    try {
      const stream = await getMicrophoneStream();
      streamRef.current = stream;

      const handleChunk = (chunk: Blob) => {
        onChunkRef.current?.(chunk);
      };

      const recorder = createStreamRecorder(stream, handleChunk);
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      const micError = toMicrophoneError(err);
      setError(micError.message);
      if (streamRef.current) {
        stopMicrophoneStream(streamRef.current);
        streamRef.current = null;
      }
      recorderRef.current = null;
    } finally {
      setIsRequestingPermission(false);
    }
  }, [isRecording]);

  return {
    isRecording,
    isRequestingPermission,
    toggleRecording,
    error,
    setError,
  };
}
