"use client";

import { useRef, useEffect } from "react";
import { useRecordingState } from "@/hooks/useRecordingState";
import { createDeepgramClient } from "@/deepgram";
import type { DeepgramTranscriptResult, DeepgramClientError } from "@/deepgram";

export interface UseVoicePipelineOptions {
  /** Deepgram API key. If not set, use tokenUrl (or default) for a short-lived token. */
  apiKey?: string;
  /** URL to fetch a short-lived Deepgram access token (JSON with access_token). Used when apiKey is not set. */
  tokenUrl?: string;
  /** Called for each transcript event (partial and final). */
  onTranscript?: (result: DeepgramTranscriptResult) => void;
  /** Called on STT/connection error. */
  onError?: (err: DeepgramClientError) => void;
}

/**
 * Composes recording state with Deepgram streaming STT.
 * When apiKey or tokenUrl is set and recording starts, opens a Deepgram connection
 * (fetching a token from tokenUrl when no apiKey) and forwards audio chunks;
 * when recording stops, closes the connection.
 * Transcript events are passed to onTranscript for the transcript manager / UI.
 */
export function useVoicePipeline(options: UseVoicePipelineOptions = {}) {
  const { apiKey, tokenUrl, onTranscript, onError } = options;
  const handleRef = useRef<ReturnType<ReturnType<typeof createDeepgramClient>["startListening"]> | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  onTranscriptRef.current = onTranscript;
  onErrorRef.current = onError;

  const onChunk = (chunk: Blob) => {
    handleRef.current?.send(chunk);
  };

  const hasCredential = Boolean(apiKey || tokenUrl);
  const recording = useRecordingState(
    hasCredential ? { onChunk } : {}
  );

  useEffect(() => {
    if (!hasCredential || !recording.isRecording) {
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

    if (apiKey) {
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
    }

    if (!tokenUrl) return;

    let cancelled = false;
    fetch(tokenUrl)
      .then((res) => {
        if (cancelled) return null;
        if (!res.ok) {
          throw new Error(`Token request failed: ${res.status}`);
        }
        return res.json();
      })
      .then((data: { access_token?: string }) => {
        if (cancelled) return;
        const access_token = data?.access_token;
        if (typeof access_token !== "string") {
          onErrorRef.current?.({
            code: "unknown",
            message: "Failed to get speech token",
          });
          return;
        }
        const client = createDeepgramClient({
          accessToken: access_token,
          onTranscript: (result) => onTranscriptRef.current?.(result),
          onError: (err) => onErrorRef.current?.(err),
        });
        handleRef.current = client.startListening();
      })
      .catch((err) => {
        if (cancelled) return;
        onErrorRef.current?.({
          code: "network",
          message: err instanceof Error ? err.message : "Failed to get speech token",
        });
      });

    return () => {
      cancelled = true;
      const handle = handleRef.current;
      handleRef.current = null;
      handle?.stop();
    };
  }, [apiKey, tokenUrl, recording.isRecording]);

  return recording;
}
