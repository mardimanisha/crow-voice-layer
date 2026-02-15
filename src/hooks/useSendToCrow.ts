"use client";

import { useCallback } from "react";
import { getCrowAdapter } from "@/crow";

/**
 * Send-to-Crow hook. Uses Crow adapter (SDK or DOM); VoicePanel Send calls send(editedTranscript).
 */
export function useSendToCrow() {
  const adapter = getCrowAdapter();
  const isAvailable = adapter.isAvailable();

  const send = useCallback((text: string) => {
    const current = getCrowAdapter();
    if (current.isAvailable()) {
      current.send(text);
    }
  }, []);

  return { send, isAvailable };
}
