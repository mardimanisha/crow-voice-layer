"use client";

import { useCallback } from "react";
import { getCrowAdapter } from "@/crow";
import { useVoiceLayerContext } from "@/context/VoiceLayerContext";

/**
 * Send-to-Crow hook. Uses Crow adapter from VoiceLayerProvider context when provided and available,
 * otherwise fall back to getCrowAdapter() (SDK then DOM). VoicePanel Send calls send(editedTranscript).
 */
export function useSendToCrow() {
  const context = useVoiceLayerContext();
  const adapterFromContext = context?.crowAdapter ?? null;
  const adapter =
    adapterFromContext && adapterFromContext.isAvailable()
      ? adapterFromContext
      : getCrowAdapter();
  const isAvailable = adapter.isAvailable();

  const send = useCallback(
    (text: string) => {
      const current =
        adapterFromContext && adapterFromContext.isAvailable()
          ? adapterFromContext
          : getCrowAdapter();
      if (current.isAvailable()) {
        current.send(text);
      }
    },
    [adapterFromContext]
  );

  return { send, isAvailable };
}
