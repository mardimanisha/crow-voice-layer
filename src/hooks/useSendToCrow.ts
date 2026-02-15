"use client";

import { useCallback } from "react";
import { sendToCrowMock } from "@/services/crow-mock";

/**
 * Send-to-Crow hook. Phase E will replace the mock with the real Crow adapter
 * (adapter.send(text), adapter.isAvailable()).
 */
export function useSendToCrow() {
  const send = useCallback((text: string) => {
    sendToCrowMock(text);
  }, []);

  const isAvailable = true;

  return { send, isAvailable };
}
