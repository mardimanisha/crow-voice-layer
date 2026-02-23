"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { CrowAdapter } from "@/crow";

export interface VoiceLayerContextValue {
  crowAdapter: CrowAdapter | null;
  /** Optional Deepgram API key. When set, used directly instead of token URL. */
  deepgramApiKey?: string | null;
  /** Optional token URL for short-lived Deepgram tokens. When set (and no deepgramApiKey), pipeline fetches token from this URL. */
  deepgramTokenUrl?: string | null;
}

const VoiceLayerContext = createContext<VoiceLayerContextValue | null>(null);

export interface VoiceLayerProviderProps {
  /** Optional Crow adapter. When provided, Send uses this instead of built-in SDK/DOM detection. */
  crowAdapter?: CrowAdapter | null;
  /** Optional Deepgram API key. When provided, used directly; otherwise token URL (or default) is used. */
  deepgramApiKey?: string | null;
  /** Optional Deepgram token endpoint URL. Used when no deepgramApiKey; host apps running their own token API can set this. */
  deepgramTokenUrl?: string | null;
  children: ReactNode;
}

/**
 * Provider for the voice layer. Optional: wrap your app or page when you need to supply
 * a custom Crow adapter. When not used, the voice layer falls back to getCrowAdapter() (SDK then DOM).
 */
export function VoiceLayerProvider({
  crowAdapter = null,
  deepgramApiKey = null,
  deepgramTokenUrl = null,
  children,
}: VoiceLayerProviderProps) {
  const value = useMemo<VoiceLayerContextValue>(
    () => ({
      crowAdapter: crowAdapter ?? null,
      deepgramApiKey: deepgramApiKey ?? null,
      deepgramTokenUrl: deepgramTokenUrl ?? null,
    }),
    [crowAdapter, deepgramApiKey, deepgramTokenUrl]
  );
  return (
    <VoiceLayerContext.Provider value={value}>
      {children}
    </VoiceLayerContext.Provider>
  );
}

export function useVoiceLayerContext(): VoiceLayerContextValue | null {
  return useContext(VoiceLayerContext);
}
