"use client";

import { useRef, useEffect } from "react";
import { useRecordingState } from "@/hooks/useRecordingState";
import { createDeepgramClient } from "@/deepgram";
import type { DeepgramTranscriptResult, DeepgramClientError } from "@/deepgram";

export interface UseVoicePipelineOptions {
  /** Deepgram API key. If not set, recording works but no STT (no onChunk to Deepgram). */
  apiKey?: string;
  /** Called for each transcript event (partial and final). */
  onTranscript?: (result: DeepgramTranscriptResult) => void;
  /** Called on STT/connection error. */
  onError?: (err: DeepgramClientError) => void;
}

/**
 * Composes recording state with Deepgram streaming STT.
 * When apiKey is set and recording starts, opens a Deepgram connection and forwards
 * audio chunks; when recording stops, closes the connection.
 * Transcript events are passed to onTranscript for the transcript manager / UI.
 */
export function useVoicePipeline(options: UseVoicePipelineOptions = {}) {
  const { apiKey, onTranscript, onError } = options;
  const handleRef = useRef<ReturnType<ReturnType<typeof createDeepgramClient>["startListening"]> | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  onTranscriptRef.current = onTranscript;
  onErrorRef.current = onError;

  const onChunk = (chunk: Blob) => {
    handleRef.current?.send(chunk);
  };

  const recording = useRecordingState(
    apiKey ? { onChunk } : {}
  );

  useEffect(() => {
    if (!apiKey || !recording.isRecording) {
      if (handleRef.current) {
        const handle = handleRef.current;
        handleRef.current = null;
        const timer = setTimeout(() => handle.stop(), 300);
        return () => {
          clearTimeout(timer);
          handle.stop();
        };
      }
      return;
    }

    const client = createDeepgramClient({
      apiKey,
      onTranscript: (result) => onTranscriptRef.current?.(result),
      onError: (err) => onErrorRef.current?.(err),
    });
    handleRef.current = client.startListening();

    return () => {
      const handle = handleRef.current;
      handleRef.current = null;
      handle?.stop();
    };
  }, [apiKey, recording.isRecording]);

  return recording;
}
