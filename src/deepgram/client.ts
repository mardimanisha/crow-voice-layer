/**
 * Deepgram streaming STT client.
 * Consumes audio chunks from the audio layer, sends to Deepgram over WebSocket,
 * emits raw transcript events for the transcript manager.
 *
 * Contract:
 * - Input: Blob chunks (from audio/recorder via send(chunk)).
 * - Output: onTranscript(result) with transcript, confidence, is_final, speech_final.
 */

import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import type { LiveTranscriptionEvent } from "@deepgram/sdk";
import type {
  DeepgramClientOptions,
  DeepgramClientError,
  DeepgramTranscriptResult,
  DeepgramListeningHandle,
} from "./types";

const DEFAULT_KEEP_ALIVE_THRESHOLD_MS = 8000;
const DEFAULT_MODEL = "nova-2";
const DEFAULT_LANGUAGE = "en-US";

function toClientError(error: unknown): DeepgramClientError {
  if (error && typeof error === "object" && "message" in error) {
    const msg = String((error as { message: unknown }).message);
    if (/auth|unauthorized|401|403/i.test(msg)) {
      return { code: "auth", message: msg };
    }
    if (/network|fetch|websocket|ECONNREFUSED|ETIMEDOUT/i.test(msg)) {
      return { code: "network", message: msg };
    }
    if (/5\d{2}|server|internal/i.test(msg)) {
      return { code: "server", message: msg };
    }
    return { code: "unknown", message: msg };
  }
  return {
    code: "unknown",
    message: error instanceof Error ? error.message : "Deepgram error",
  };
}

function mapTranscriptEvent(data: LiveTranscriptionEvent): DeepgramTranscriptResult | null {
  const alt = data.channel?.alternatives?.[0];
  if (!alt) return null;
  return {
    transcript: alt.transcript ?? "",
    confidence: typeof alt.confidence === "number" ? alt.confidence : 0,
    is_final: data.is_final ?? false,
    speech_final: data.speech_final ?? false,
  };
}

/**
 * Create a Deepgram client. Call startListening() to open the connection and get a handle to send chunks and stop.
 */
export function createDeepgramClient(options: DeepgramClientOptions): {
  startListening: () => DeepgramListeningHandle;
} {
  const {
    apiKey,
    accessToken,
    onTranscript,
    onOpen,
    onClose,
    onError,
    model = DEFAULT_MODEL,
    language = DEFAULT_LANGUAGE,
    smart_format = true,
    interim_results = true,
    keepAliveThresholdSeconds = 8,
  } = options;

  const credential = accessToken != null ? { accessToken } : apiKey != null ? apiKey : undefined;
  if (!credential) {
    throw new Error("createDeepgramClient requires apiKey or accessToken");
  }

  return {
    startListening() {
      const deepgram =
        typeof credential === "object"
          ? createClient(credential)
          : createClient(credential);
      const connection = deepgram.listen.live({
        model,
        language,
        smart_format,
        interim_results,
        // Containerized WebM/Opus from recorder; do not set encoding/sample_rate.
      });

      let keepAliveTimer: ReturnType<typeof setTimeout> | null = null;
      let lastChunkTime = 0;
      let stopped = false;
      const pendingChunks: ArrayBuffer[] = [];

      const flushPendingChunks = () => {
        for (const buffer of pendingChunks) {
          try {
            if (connection.getReadyState() === 1) connection.send(buffer);
          } catch {
            // ignore
          }
        }
        pendingChunks.length = 0;
      };

      const scheduleKeepAlive = () => {
        if (stopped) return;
        if (keepAliveTimer) clearTimeout(keepAliveTimer);
        keepAliveTimer = setTimeout(() => {
          keepAliveTimer = null;
          if (stopped) return;
          try {
            if (connection.getReadyState() === 1) {
              connection.keepAlive();
            }
          } catch {
            // ignore
          }
          scheduleKeepAlive();
        }, keepAliveThresholdSeconds * 1000);
      };

      const clearKeepAlive = () => {
        if (keepAliveTimer) {
          clearTimeout(keepAliveTimer);
          keepAliveTimer = null;
        }
      };

      connection.on(LiveTranscriptionEvents.Open, () => {
        flushPendingChunks();
        onOpen?.();
        scheduleKeepAlive();
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data: LiveTranscriptionEvent) => {
        const result = mapTranscriptEvent(data);
        if (result) onTranscript(result);
      });

      connection.on(LiveTranscriptionEvents.Error, (err: unknown) => {
        onError?.(toClientError(err));
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        clearKeepAlive();
        onClose?.();
      });

      return {
        send(chunk: Blob) {
          if (stopped) return;
          lastChunkTime = Date.now();
          chunk
            .arrayBuffer()
            .then((buffer) => {
              if (stopped) return;
              if (connection.getReadyState() === 1) {
                connection.send(buffer);
              } else {
                pendingChunks.push(buffer);
              }
            })
            .catch((err) => {
              onError?.(toClientError(err));
            });
        },
        stop() {
          if (stopped) return;
          clearKeepAlive();
          try {
            connection.finalize();
          } catch {
            // ignore
          }
          // Allow in-flight sends and Deepgram to process Finalize before CloseStream
          setTimeout(() => {
            stopped = true;
            pendingChunks.length = 0;
            try {
              connection.requestClose();
            } catch {
              // ignore
            }
          }, 300);
        },
      };
    },
  };
}
